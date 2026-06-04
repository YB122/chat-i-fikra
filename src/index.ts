import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";
import { dataBaseConnection } from "./infrastructure/database/mongoose-connection.ts";
import { MongoUserRepository } from "./infrastructure/repositories/mongo-user.repository.ts";
import { MongoMessageRepository } from "./infrastructure/repositories/mongo-message.repository.ts";
import { CloudinaryService } from "./infrastructure/services/cloudinary.service.ts";
import { ChatController } from "./presentation/http/controllers/chat.controller.ts";
import { createRoutes } from "./presentation/http/routes.ts";
import { ChatGateway } from "./presentation/sockets/chat.gateway.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

dataBaseConnection();

const userRepository = new MongoUserRepository();
const messageRepository = new MongoMessageRepository();
const cloudinaryService = new CloudinaryService();

const chatController = new ChatController(userRepository, messageRepository, cloudinaryService);

app.use(createRoutes(chatController));

const server = app.listen(3002, () => {
  console.log("Server running clean on port 3002");
});

const io = new Server(server, { cors: { origin: "*" } });
new ChatGateway(io, userRepository, messageRepository);
