import { UserRepository } from "../../domain/repositories/user.repository.ts";
import { User } from "../../domain/entities/user.entity.ts";
import { userModel } from "../database/models/user.model.ts";

export class MongoUserRepository implements UserRepository {
  async findOrCreate(name: string, room: string): Promise<{ user: User; existed: boolean }> {
    const userFound = await userModel.findOne({ name, room });
    if (userFound) {
      return { user: this.mapToEntity(userFound), existed: true };
    }
    const [newUser] = await userModel.insertMany([{ name, room }]);
    return { user: this.mapToEntity(newUser), existed: false };
  }

  async setOnlineStatus(name: string, room: string, isOnline: boolean): Promise<void> {
    await userModel.findOneAndUpdate({ name, room }, { isOnline });
  }

  async getRoomUsers(room: string): Promise<User[]> {
    const users = await userModel.find({ room });
    return users.map((u) => this.mapToEntity(u));
  }

  async findOneByNameAndRoom(name: string, room: string): Promise<User | null> {
    const user = await userModel.findOne({ name, room });
    return user ? this.mapToEntity(user) : null;
  }

  private mapToEntity(doc: any): User {
    return {
      id: doc._id.toString(),
      name: doc.name,
      room: doc.room,
      isOnline: doc.isOnline,
    };
  }
}