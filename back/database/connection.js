import "dotenv/config";
import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.8.4"]);

export const dataBaseConnection = () => {
  mongoose
    .connect(process.env.DATA_BASE)
    .then(() => console.log("data base connected"))
    .catch((err) => console.log(err));
};
