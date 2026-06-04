import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server, Socket } from "socket.io";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { formatMessage } from "../utils/message.js";
import {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} from "../utils/users.js";

import { dataBaseConnection } from "./database/connection.js";
import { userModel } from "./database/model/user.model.js";
import { messageModel } from "./database/model/message.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));
dataBaseConnection();

app.post("/go-to-room", async (req, res) => {
  try {
    const { name, room } = req.body;
    const userFound = await userModel.findOne({ name, room });
    if (userFound) {
      return res.status(201).json({ message: "user existed", data: userFound });
    }
    await userModel.create({ name, room });
    res.status(200).json({ message: "done, user added" });
  } catch (error) {
    console.error("go-to-room error:", error);
    res.status(500).json({ message: "server error" });
  }
});

app.get("/all-messages-for-room", async (req, res) => {
  const { room } = req.query;
  try {
    const messages = await messageModel
      .find({ room })
      .populate("userId")
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

app.post("/upload-file", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "no file uploaded" });
    }
    const fileStr = req.file.buffer.toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${fileStr}`;

    const mime = req.file.mimetype;
    const isImage = mime.startsWith("image/");
    const isAudio = mime.startsWith("audio/");
    const isVideo = mime.startsWith("video/");
    const parsed = path.parse(req.file.originalname);
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      resource_type: "auto",
      folder: "skychat",
      public_id: `${parsed.name}-${Date.now()}${parsed.ext}`,
    });

    res.status(200).json({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      type: isImage ? "image" : isAudio ? "audio" : isVideo ? "video" : "file",
      name: req.file.originalname,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "upload failed" });
  }
});

app.post("/add-message", async (req, res) => {
  const { name, room, content, file } = req.body;
  const user = await userModel.findOne({ name, room });
  if (user) {
    const messageData: Record<string, any> = { room, userId: user._id };
    if (content) messageData.content = content;
    if (file) messageData.file = file;

    const newMessage = await messageModel.insertMany(messageData);
    if (newMessage) {
      res.status(200).json({ message: "message write done", data: newMessage });
    } else {
      res.status(400).json({ message: "failed to write message" });
    }
  } else {
    res.status(404).json({ messages: "not found user" });
  }
});

const server = app.listen(3002, () => {
  console.log("Server running on port 3002");
});

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

interface FilePayload {
  url: string;
  publicId: string;
  type: "image" | "file" | "audio";
  name: string;
}

io.on("connection", (socket: Socket) => {
  console.log("connected");

  socket.on(
    "joinRoom",
    async ({ userName, room }: { userName: string; room: string }) => {
      try {
        const user = userJoin(socket.id, userName, room);
        socket.join(user.room);

        await userModel.findOneAndUpdate(
          { name: userName, room },
          { isOnline: true },
        );

        socket.emit("joinedRoom", { room: user.room });
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
      } catch (error) {
        console.error("joinRoom error:", error);
      }
    },
  );

  socket.on("typing", (isTyping: boolean) => {
    const user = getCurrentUser(socket.id);
    if (user) {
      socket.broadcast.to(user.room).emit("displayTyping", {
        userName: user.userName,
        isTyping,
      });
    }
  });

  socket.on("chatMessage", (msg: string | { text: string; file: FilePayload }) => {
    const user = getCurrentUser(socket.id);
    if (!user) return;

    const text = typeof msg === "string" ? msg : msg.text;
    const file = typeof msg === "object" ? msg.file : undefined;

    const formattedMessage = file
      ? { userName: user.userName, text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), file }
      : formatMessage(user.userName, text);

    io.to(user.room).emit("message", formattedMessage);

    userModel
      .findOne({ name: user.userName, room: user.room })
      .then((dbUser) => {
        if (dbUser) {
          const messageData: Record<string, any> = {
            room: user.room,
            userId: dbUser._id,
          };
          if (text) messageData.content = text;
          if (file) messageData.file = file;
          return messageModel.create(messageData);
        }
      })
      .catch((err) => console.error("Error saving message:", err));
  });

  socket.on("disconnect", async () => {
    try {
      const user = userLeave(socket.id);
      if (!user) return;

      await userModel.findOneAndUpdate(
        { name: user.userName, room: user.room },
        { isOnline: false },
      );

      io.to(user.room).emit(
        "message",
        formatMessage("Chat", `${user.userName} has left the chat`),
      );

      const allRoomUsers = await userModel.find({ room: user.room });
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: allRoomUsers,
      });
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  });
});
