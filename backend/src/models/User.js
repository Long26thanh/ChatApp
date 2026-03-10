import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        hashPassword: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        displayName: {
            type: String,
            required: true,
            trim: true,
        },
        avatarUrl: {
            type: String, // Dường dẫn URL đến avatar của người dùng
        },
        avatarId: {
            type: String, // ID của ảnh đại diện, được sử dụng để quản lý và truy xuất ảnh từ dịch vụ lưu trữ
        },
        bio: {
            type: String,
            maxLength: 500,
        },
        phone: {
            type: String,
            sparse: true, // Cho phép giá trị null nhưng vẫn đảm bảo tính duy nhất khi có giá trị
        },
    },
    { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
