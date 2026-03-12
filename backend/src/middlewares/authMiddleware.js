import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectedRoute = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) {
            return res
                .status(401)
                .json({ message: "Không tìm thấy access token" });
        }

        // Xác thực token
        jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET,
            async (err, decoded) => {
                if (err) {
                    console.error("Lỗi xác thực token:", err);
                    return res
                        .status(401)
                        .json({ message: "Token không hợp lệ" });
                }
                // Lấy thông tin người dùng từ token
                const user = await User.findById(decoded.userId).select(
                    "-hashPassword",
                );
                if (!user) {
                    return res
                        .status(404)
                        .json({ message: "Người dùng không tồn tại" });
                }
                req.user = user; // Gắn thông tin người dùng vào request
                next(); // Chuyển sang phần tiếp theo
            },
        );
    } catch (error) {
        console.error("Lỗi xác thực:", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export default protectedRoute;
