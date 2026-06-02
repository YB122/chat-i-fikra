import mongoose from "mongoose";
const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    content: { type: String, required: true },
    room: { type: String, required: true },
    userId: { type: mongoose.Types.ObjectId, ref: "users", required: true },
  },
  { timestamps: true },
);

export const messageModel = mongoose.model("messages", messageSchema);
