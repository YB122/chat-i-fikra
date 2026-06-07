import { UserRepository } from "../../domain/repositories/user.repository.ts";
import { User } from "../../domain/entities/user.entity.ts";

export class JoinRoomUseCase {
  private userRepo: UserRepository;

  constructor(userRepo: UserRepository) {
    this.userRepo = userRepo;
  }

  async execute(userName: string, room: string): Promise<User[]> {
    await this.userRepo.setOnlineStatus(userName, room, true);

    return await this.userRepo.getRoomUsers(room);
  }
}