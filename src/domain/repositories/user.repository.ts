import { User } from "../entities/user.entity.ts";

export interface UserRepository {
  findOrCreate(name: string, room: string): Promise<{ user: User; existed: boolean }>;
  setOnlineStatus(name: string, room: string, isOnline: boolean): Promise<void>;
  getRoomUsers(room: string): Promise<User[]>;
  findOneByNameAndRoom(name: string, room: string): Promise<User | null>;
}