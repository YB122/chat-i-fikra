import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";
import { formatMessage } from "./../utils/message.js";
import {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} from "./../utils/users.js";

import { dataBaseConnection } from "./database/connection.js";
import { userModel } from "./database/model/user.model.js";
import { messageModel } from "./database/model/message.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));
dataBaseConnection();

app.post("/go-to-room", async (req, res) => {
  const { name, room } = req.body;
  let userFound = await userModel.findOne({ name, room });
  if (userFound) {
    return res.status(201).json({ message: "user existed", data: userFound });
  }
  let newUser = await userModel.insertMany({ name, room });
  if (newUser) {
    res.status(200).json({ message: "done, user added", data: newUser });
  } else {
    res.status(400).json({ message: "failed" });
  }
});

app.get("/all-messages-for-room", async (req, res) => {
  const { room } = req.query;
  try {
    let messages = await messageModel
      .find({ room })
      .populate('userId')
      .sort({ createdAt: 1 });
    if (messages.length >= 0) {
      res.status(200).json({ message: "chat found", data: messages });
    } else {
      res.status(404).json({ message: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: "something wrong" });
  }
});

app.post("/add-message", async (req, res) => {
  const { name, room, content } = req.body;
  let user = await userModel.findOne({ name, room });
  if (user) {
    let newMessage = await messageModel.insertMany({
      room,
      content,
      userId: user._id,
    });
    if (newMessage) {
      res.status(200).json({ message: "message write done", data: newMessage });
    } else {
      res.status(400).json({ message: "failed to write message" });
    }
  } else {
    res.status(404).json({ messages: "not found user" });
  }
});

const server = app.listen(3001, () => {
  console.log("Server running on port 3001");
});

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("connected");

  socket.on("joinRoom", async ({ userName, room }) => {
    const user = userJoin(socket.id, userName, room);
    socket.join(user.room);

    await userModel.findOneAndUpdate(
      { name: userName, room: room },
      { isOnline: true },
    );

    socket.emit("message", formatMessage("Chat", "Welcome back!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage("Chat", `${user.userName} has joined the chat`),
      );

    const allRoomUsers = await userModel.find({ room: user.room });
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: allRoomUsers,
    });
  });

  socket.on("typing", (isTyping) => {
    const user = getCurrentUser(socket.id);
    if (user) {
      socket.broadcast.to(user.room).emit("displayTyping", {
        userName: user.userName,
        isTyping,
      });
    }
  });

  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    if (user) {
      const formattedMessage = formatMessage(`${user.userName}`, msg);

      io.to(user.room).emit("message", formattedMessage);


      userModel
        .findOne({ name: user.userName, room: user.room })
        .then((dbUser) => {
          if (dbUser) {
            return messageModel.create({
              room: user.room,
              content: msg,
              userId: dbUser._id,
            });
          }
        })
        .catch((err) => console.error("Error saving message:", err));
    }
  });

  socket.on("disconnect", async () => {
    const user = userLeave(socket.id);
    if (!user) return;

    await userModel.findOneAndUpdate(
      { name: user.userName, room: user.room },
      { isOnline: false },
    );

    socket
      .to(user.room)
      .emit(
        "message",
        formatMessage("Chat", `${user.userName} has left the chat`),
      );

    const allRoomUsers = await userModel.find({ room: user.room });
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: allRoomUsers,
    });
  });
});
