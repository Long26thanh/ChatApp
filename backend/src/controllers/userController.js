import User from "../models/User.js";

const normalizeQueryUsername = (username) => {
    if (Array.isArray(username)) {
        return username[0];
    }
    return username;
};

class UserController {
    async authMe(req, res) {
        try {
            const user = req.user;

            return res.status(200).json({
                user,
            });
        } catch (error) {
            console.error("Lỗi xác thực người dùng:", error);
            return res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }

    async searchUserByUsername(req, res) {
        try {
            const rawUsername = normalizeQueryUsername(req.query?.username);
            if (typeof rawUsername !== "string" || rawUsername.trim() === "") {
                return res.status(400).json({
                    message: "Vui lòng cung cấp tên người dùng để tìm kiếm",
                });
            }

            const normalizedUsername = rawUsername.trim().toLowerCase();
            const currentUserId = req.user?._id?.toString();

            const users = await User.find({
                username: normalizedUsername,
                ...(currentUserId ? { _id: { $ne: currentUserId } } : {}),
            })
                .select("_id displayName username avatarUrl")
                .lean()
                .limit(10);

            return res.status(200).json({ users });
        } catch (error) {
            console.error("Lỗi tìm kiếm người dùng:", error);
            return res.status(500).json({
                message:
                    process.env.NODE_ENV === "development"
                        ? `Lỗi hệ thống: ${error.message}`
                        : "Lỗi hệ thống",
            });
        }
    }
}

export default new UserController();
