import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.8.4"]);

export const dataBaseConnection = () => {
  mongoose
    .connect("mongodb+srv://youssefbenyamineiti2025_db_user:youssef@cluster0.ax7vlz9.mongodb.net/ifikra-chat")
    .then(() => console.log("data base connected"))
    .catch((err) => console.log(err));
};
