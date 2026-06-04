import { Server, Socket } from "socket.io";
import { UserRepository } from "../../domain/repositories/user.repository.ts";
import { MessageRepository } from "../../domain/repositories/message.repository.ts";
import { formatMessage } from "../../../utils/message.js";
import { userJoin, getCurrentUser, userLeave } from "../../../utils/users.js";

export class ChatGateway {
  constructor(
    private io: Server,
    private userRepo: UserRepository,
    private messageRepo: MessageRepository
  ) {
    this.init();
  }

  private init() {
    this.io.on("connection", (socket: Socket) => {
      console.log("Connected:", socket.id);

      // 1. Join Room
      socket.on("joinRoom", async ({ userName, room }: { userName: string; room: string }) => {
        try {
          const user = userJoin(socket.id, userName, room);
          socket.join(user.room);

          await this.userRepo.setOnlineStatus(userName, room, true);

          socket.emit("joinedRoom", { room: user.room });
          socket.emit("message", formatMessage("Chat", "Welcome back!"));
          socket.broadcast
            .to(user.room)
            .emit("message", formatMessage("Chat", `${user.userName} has joined the chat`));

          const allRoomUsers = await this.userRepo.getRoomUsers(user.room);
          this.io.to(user.room).emit("roomUsers", { room: user.room, users: allRoomUsers });
        } catch (error) {
          console.error("joinRoom error:", error);
        }
      });

      // 2. Typing
      socket.on("typing", (isTyping: boolean) => {
        const user = getCurrentUser(socket.id);
        if (user) {
          socket.broadcast.to(user.room).emit("displayTyping", { userName: user.userName, isTyping });
        }
      });

      // 3. Chat Message
      socket.on("chatMessage", async (msg: any) => {
        const user = getCurrentUser(socket.id);
        if (!user) return;

        const text = typeof msg === "string" ? msg : msg.text;
        const file = typeof msg === "object" ? msg.file : undefined;

        const formattedMessage = file
          ? { userName: user.userName, text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), file }
          : formatMessage(user.userName, text);

        this.io.to(user.room).emit("message", formattedMessage);

        try {
          const dbUser = await this.userRepo.findOneByNameAndRoom(user.userName, user.room);
          if (dbUser) {
            await this.messageRepo.createMessage({
              room: user.room,
              userId: dbUser.id,
              content: text,
              file,
            });
          }
        } catch (err) {
          console.error("Error saving message:", err);
        }
      });

      // 4. Disconnect
      socket.on("disconnect", async () => {
        try {
          const user = userLeave(socket.id);
          if (!user) return;

          await this.userRepo.setOnlineStatus(user.userName, user.room, false);

          this.io.to(user.room).emit("message", formatMessage("Chat", `${user.userName} has left the chat`));

          const allRoomUsers = await this.userRepo.getRoomUsers(user.room);
          this.io.to(user.room).emit("roomUsers", { room: user.room, users: allRoomUsers });
        } catch (error) {
          console.error("Disconnect error:", error);
        }
      });
    });
  }
}