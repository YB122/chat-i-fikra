import { Request, Response } from "express";
import { UserRepository } from "../../../domain/repositories/user.repository.ts";
import { MessageRepository } from "../../../domain/repositories/message.repository.ts";
import { CloudinaryService } from "../../../infrastructure/services/cloudinary.service.ts";

export class ChatController {
  constructor(
    private userRepo: UserRepository,
    private messageRepo: MessageRepository,
    private cloudinaryService: CloudinaryService
  ) {}

  goToRoom = async (req: Request, res: Response) => {
    const { name, room } = req.body;
    const { user, existed } = await this.userRepo.findOrCreate(name, room);
    const status = existed ? 201 : 200;
    return res.status(status).json({ message: existed ? "user existed" : "done, user added", data: user });
  };

  allMessagesForRoom = async (req: Request, res: Response) => {
    const { room } = req.query;
    try {
      const messages = await this.messageRepo.getMessagesByRoom(room as string);
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

  addMessage = async (req: Request, res: Response) => {
    const { name, room, content, file } = req.body;
    const user = await this.userRepo.findOneByNameAndRoom(name, room);
    if (!user) return res.status(404).json({ message: "not found user" });

    const newMessage = await this.messageRepo.createMessage({
      room,
      userId: user.id,
      content,
      file,
    });
    return res.status(200).json({ message: "message write done", data: newMessage });
  };
}