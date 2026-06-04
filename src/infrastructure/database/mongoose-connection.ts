import "dotenv/config";
import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.8.4"]);

export const dataBaseConnection = (): void => {
  mongoose
    .connect(process.env.DATA_BASE!)
    .then(() => console.log("Database connected successfully "))
    .catch((err) => console.error("Database connection error:", err));
};