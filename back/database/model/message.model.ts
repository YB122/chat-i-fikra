import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMessage extends Document {
  content: string;
  room: string;
  userId: Types.ObjectId;
}

const messageSchema = new Schema<IMessage>(
  {
    content: { type: String, required: true },
    room: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
  },
  { timestamps: true },
);

export const messageModel = mongoose.model<IMessage>("messages", messageSchema);
