import { MessageRepository } from "../../domain/repositories/message.repository.ts";
import { Message } from "../../domain/entities/message.entity.ts";
import { messageModel } from "../database/models/message.model.ts";

export class MongoMessageRepository implements MessageRepository {
  async createMessage(messageData: Partial<Message>): Promise<Message> {
    const dbData = {
      room: messageData.room,
      content: messageData.content,
      userId: messageData.userId,
      file: messageData.file,
    };
    const [newMessage] = await messageModel.insertMany([dbData]);
    return this.mapToEntity(newMessage);
  }

  async getMessagesByRoom(room: string): Promise<Message[]> {
    const messages = await messageModel
      .find({ room })
      .populate("userId")
      .sort({ createdAt: 1 });
      
    return messages.map((m) => this.mapToEntity(m));
  }

  private mapToEntity(doc: any): Message {
    return {
      id: doc._id.toString(),
      content: doc.content,
      room: doc.room,
      userId: doc.userId,
      file: doc.file,
      createdAt: doc.createdAt,
    };
  }
}