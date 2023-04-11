import express from "express";
import { config } from "dotenv";
import user from "./routes/user.js";
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import cors from "cors";

config({
    path: "./data/config.env"
});

export const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({

    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    origin: "*"
}));

app.get("/", (req, res, next) => {
    res.send("Working");
});
app.use("/api/user", user);

app.use(errorMiddleware);