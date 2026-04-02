import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const socketAuthMiddleware = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Unauthorized: Token không được cung cấp"));
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded) {
            return next(new Error("Unauthorized: Token không hợp lệ"));
        }

        const user = await User.findById(decoded.userId).select(
            "-hashedPassword",
        );

        if (!user) {
            return next(new Error("Người dùng không tồn tại"));
        }

        socket.user = user;
        next();
    } catch (err) {
        console.error("Lỗi khi xác thực token trong socket:", err);
        next(new Error("Unauthorized"));
    }
};
