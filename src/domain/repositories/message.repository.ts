import { Message } from "../entities/message.entity.ts";

export interface MessageRepository {
  createMessage(messageData: Partial<Message>): Promise<Message>;
  getMessagesByRoom(room: string): Promise<Message[]>;
}