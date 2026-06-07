import { UserRepository } from "../../domain/repositories/user.repository.ts";
import { User } from "../../domain/entities/user.entity.ts";

export class GoToRoomUseCase {
  private userRepo: UserRepository;

  constructor(userRepo: UserRepository) {
    this.userRepo = userRepo;
  }

  async execute(name: string, room: string): Promise<{ user: User; existed: boolean }> {
    return await this.userRepo.findOrCreate(name, room);
  }
}