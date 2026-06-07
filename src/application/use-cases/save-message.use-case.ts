import { MessageRepository } from "../../domain/repositories/message.repository.ts";
import { UserRepository } from "../../domain/repositories/user.repository.ts";
import { Message } from "../../domain/entities/message.entity.ts";

export class SaveMessageUseCase {
  private messageRepo: MessageRepository;
  private userRepo: UserRepository;

  constructor(messageRepo: MessageRepository, userRepo: UserRepository) {
    this.messageRepo = messageRepo;
    this.userRepo = userRepo;
  }

  async execute(userName: string, room: string, content: string, file?: any): Promise<Message | null> {
    const user = await this.userRepo.findOneByNameAndRoom(userName, room);
    if (!user) return null;

    return await this.messageRepo.createMessage({
      room,
      userId: user.id,
      content,
      file,
    });
  }
}