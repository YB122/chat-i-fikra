import { Server, Socket } from "socket.io";
import { UserRepository } from "../../domain/repositories/user.repository.ts";
import { SaveMessageUseCase } from "../../application/use-cases/save-message.use-case.ts";
import { formatMessage } from "../../../utils/message.ts";
import { userJoin, getCurrentUser, userLeave } from "../../../utils/users.ts";

export class ChatGateway {
  private io: Server;
  private userRepo: UserRepository;
  private saveMessageUseCase: SaveMessageUseCase;

  constructor(io: Server, userRepo: UserRepository, saveMessageUseCase: SaveMessageUseCase) {
    this.io = io;
    this.userRepo = userRepo;
    this.saveMessageUseCase = saveMessageUseCase;
    this.init();
  }

  private init() {
    this.io.on("connection", (socket: Socket) => {
      console.log("Connected:", socket.id);

      socket.on("joinRoom", async ({ userName, room }: { userName: string; room: string }) => {
        try {
          const user = userJoin(socket.id, userName, room);
          socket.join(user.room);

          await this.userRepo.setOnlineStatus(userName, room, true);

          socket.emit("joinedRoom");
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

      socket.on("typing", (isTyping: boolean) => {
        const user = getCurrentUser(socket.id);
        if (user) {
          socket.broadcast.to(user.room).emit("displayTyping", { userName: user.userName, isTyping });
        }
      });

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
          await this.saveMessageUseCase.execute(user.userName, user.room, text, file);
        } catch (err) {
          console.error("Error saving message via UseCase:", err);
        }
      });

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