import mongoose from "mongoose";

export const dataBaseConnection = () => {
  mongoose
    .connect("mongodb://localhost:27017/nti-chat")
    .then(() => console.log("data base connected"))
    .catch((err) => console.log(err));
};
