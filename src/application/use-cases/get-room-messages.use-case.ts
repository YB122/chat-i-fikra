import { MessageRepository } from "../../domain/repositories/message.repository.ts";
import { Message } from "../../domain/entities/message.entity.ts";

export class GetRoomMessagesUseCase {
  private messageRepo: MessageRepository;

  constructor(messageRepo: MessageRepository) {
    this.messageRepo = messageRepo;
  }

  async execute(room: string): Promise<Message[]> {
    return await this.messageRepo.getMessagesByRoom(room);
  }
}