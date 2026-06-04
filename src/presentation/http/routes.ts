import { Router } from "express";
import multer from "multer";
import { ChatController } from "./controllers/chat.controller.ts";

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const createRoutes = (chatController: ChatController): Router => {
  const router = Router();

  router.post("/go-to-room", chatController.goToRoom);
  router.get("/all-messages-for-room", chatController.allMessagesForRoom);
  router.post("/upload-file", upload.single("file"), chatController.uploadFile);

  return router;
};