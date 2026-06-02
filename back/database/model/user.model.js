import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    room: { type: String, required: true },
    isOnline: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const userModel = mongoose.model("users", userSchema);
