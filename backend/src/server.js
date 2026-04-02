import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./libs/db.js";
import routes from "./routes/index.js";
import cookieParser from "cookie-parser";
import { app, server } from "./socket/index.js";

dotenv.config();

const PORT = process.env.PORT || 5001;

// Middleware
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    }),
);
app.use(express.json());
app.use(cookieParser());

// Đăng ký Routes
routes(app);

connectDB().then(() => {
    // Routes
    server.listen(PORT, () => {
        console.log(`Server bắt đầu trên cổng ${PORT}`);
    });
});
