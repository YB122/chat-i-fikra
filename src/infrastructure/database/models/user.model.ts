import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  room: string;
  isOnline: boolean;
  createdAt: Date;
  updatedAt: Date;
}
const userSchema = new Schema<IUser>(
  {
    name: { 
      type: String, 
      required: true 
    },
    room: { 
      type: String, 
      required: true 
    },
    isOnline: { 
      type: Boolean, 
      default: false 
    },
  },
  { 
    timestamps: true 
  }
);
export const userModel = mongoose.model<IUser>("users", userSchema);

