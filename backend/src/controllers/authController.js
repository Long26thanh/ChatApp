import User from "../models/User.js";
import Session from "../models/Session.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_TOKEN_TTL = "30m"; // Thời gian sống của access token
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // Thời gian sống của refresh token

class AuthController {
    static async signUp(req, res) {
        try {
            const { username, password, email, firstname, lastname } = req.body;
            // Kiểm tra nếu thiếu thông tin bắt buộc
            if (!username || !password || !email || !firstname || !lastname) {
                return res.status(400).json({
                    message:
                        "Không được để trống username, password, email, firstname hoặc lastname",
                });
            }
            // Kiểm tra nếu username đã tồn tại
            const duplicate = await User.findOne({ username });
            if (duplicate) {
                return res.status(409).json({ message: "Username đã tồn tại" });
            }

            // Mã hóa mật khẩu
            const hashPassword = await bcrypt.hash(password, 10);

            // Tạo người dùng mới
            await User.create({
                username,
                hashPassword,
                email,
                displayName: `${firstname} ${lastname}`,
            });

            return res.status(204).json({ message: "Đăng ký thành công" });
        } catch (error) {
            console.error("Lỗi đăng ký:", error);
            return res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }

    static async signIn(req, res) {
        try {
            // Lấy thông tin đăng nhập từ request
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({
                    message: "Username và password không được để trống",
                });
            }

            // Tìm người dùng theo username
            const user = await User.findOne({ username });
            if (!user) {
                return res.status(401).json({
                    message: "username hoặc password không chính xác",
                });
            }

            // So sánh mật khẩu
            const isMatch = await bcrypt.compare(password, user.hashPassword);
            if (!isMatch) {
                return res.status(401).json({
                    message: "username hoặc password không chính xác",
                });
            }

            // Tạo access token
            const accessToken = jwt.sign(
                { userId: user._id, username: user.username },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: ACCESS_TOKEN_TTL },
            );

            // Tạo refresh token
            const refreshToken = crypto.randomBytes(64).toString("hex");
            await Session.create({
                userId: user._id,
                refreshToken,
                expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
            });

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: REFRESH_TOKEN_TTL,
            });

            return res.status(200).json({
                message: `Người dùng ${user.displayName} đăng nhập thành công`,
                accessToken,
            });
        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
            return res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }

    static async signOut(req, res) {
        try {
            // Xóa refresh token khỏi database và cookie
            const refreshToken = req.cookies?.refreshToken;
            if (refreshToken) {
                await Session.deleteOne({ refreshToken });
                res.clearCookie("refreshToken", {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                });
            }
            return res.status(204).json({ message: "Đăng xuất thành công" });
        } catch (error) {
            console.error("Lỗi đăng xuất:", error);
            return res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }
}

export default AuthController;
