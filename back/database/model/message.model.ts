import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFileAttachment {
  url: string;
  publicId: string;
  type: "image" | "file" | "audio" | "video";
  name: string;
}

export interface IMessage extends Document {
  content: string;
  room: string;
  userId: Types.ObjectId;
  file?: IFileAttachment;
}

const messageSchema = new Schema<IMessage>(
  {
    content: { type: String, default: "" },
    room: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    file: {
      url: { type: String },
      publicId: { type: String },
      type: { type: String, enum: ["image", "file", "audio", "video"] },
      name: { type: String },
    },
  },
  { timestamps: true },
);

export const messageModel = mongoose.model<IMessage>("messages", messageSchema);
