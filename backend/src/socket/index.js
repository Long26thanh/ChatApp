import { Server } from "socket.io";
import http from "http";
import express from "express";
import dotenv from "dotenv";
import { socketAuthMiddleware } from "../middlewares/socketMiddleware.js";
import ConversationController from "../controllers/conversationController.js";

dotenv.config();

const clientUrl = process.env.CLIENT_URL?.trim() || "http://localhost:5173";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: clientUrl,
        credentials: true,
    },
});

io.use(socketAuthMiddleware);

const onlineUsers = new Map();

io.on("connection", async (socket) => {
    const user = socket.user;
    console.log(
        `Người dùng ${user.username} đã kết nối với socket ID: ${socket.id}`,
    );

    // Lưu thông tin người dùng và socket ID vào onlineUsers
    onlineUsers.set(user._id.toString(), socket.id);

    io.emit("onlineUsers", Array.from(onlineUsers.keys())); // Gửi danh sách người dùng online cho tất cả client

    console.log("Socket đã kết nối: " + socket.id);

    const conversationIds =
        await ConversationController.getUserConversationsForSocketIO(user._id);
    conversationIds.forEach((id) => {
        socket.join(id); // Tham gia vào phòng của cuộc trò chuyện
    });

    // Tham gia vào các phòng tương ứng với các cuộc trò chuyện của người dùng
    socket.on("disconnect", () => {
        // Xóa người dùng khỏi danh sách online khi ngắt kết nối
        onlineUsers.delete(user._id.toString());
        io.emit("onlineUsers", Array.from(onlineUsers.keys())); // Cập nhật danh sách người dùng online

        console.log("Socket đã ngắt kết nối: " + socket.id);
    });
});

export { io, app, server, onlineUsers };
