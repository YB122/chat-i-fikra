import { Request, Response } from "express";
import { GoToRoomUseCase } from "../../../application/use-cases/go-to-room.use-case.ts";
import { GetRoomMessagesUseCase } from "../../../application/use-cases/get-room-messages.use-case.ts";
import { CloudinaryService } from "../../../infrastructure/services/cloudinary.service.ts";

export class ChatController {
  private goToRoomUseCase: GoToRoomUseCase;
  private getRoomMessagesUseCase: GetRoomMessagesUseCase;
  private cloudinaryService: CloudinaryService;

  constructor(
    goToRoomUseCase: GoToRoomUseCase,
    getRoomMessagesUseCase: GetRoomMessagesUseCase,
    cloudinaryService: CloudinaryService
  ) {
    this.goToRoomUseCase = goToRoomUseCase;
    this.getRoomMessagesUseCase = getRoomMessagesUseCase;
    this.cloudinaryService = cloudinaryService;
  }

  goToRoom = async (req: Request, res: Response) => {
    const { name, room } = req.body;
    const { user, existed } = await this.goToRoomUseCase.execute(name, room);
    const status = existed ? 201 : 200;
    return res.status(status).json({ message: existed ? "user existed" : "done, user added", data: user });
  };

  allMessagesForRoom = async (req: Request, res: Response) => {
    const { room } = req.query;
    try {
      const messages = await this.getRoomMessagesUseCase.execute(room as string);
      return res.status(200).json({ message: "chat found", data: messages });
    } catch (error) {
      return res.status(400).json({ message: "something wrong" });
    }
  };

  uploadFile = async (req: Request, res: Response) => {
    try {
      if (!req.file) return res.status(400).json({ message: "no file uploaded" });

      const uploadResult = await this.cloudinaryService.uploadBuffer(req.file.buffer, req.file.mimetype);
      const mime = req.file.mimetype;

      return res.status(200).json({
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        type: mime.startsWith("image/") ? "image" : mime.startsWith("audio/") ? "audio" : "file",
        name: req.file.originalname,
      });
    } catch (error) {
      return res.status(500).json({ message: "upload failed" });
    }
  };
}