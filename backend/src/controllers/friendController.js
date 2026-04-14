import User from "../models/User.js";
import Friend from "../models/Friend.js";
import FriendRequest from "../models/FriendRequest.js";
import mongoose from "mongoose";

class FriendController {
    async sendFriendRequest(req, res) {
        try {
            const { to, message } = req.body;
            const from = req.user._id;

            if (!to || !mongoose.Types.ObjectId.isValid(to)) {
                return res.status(400).json({
                    message: "ID người dùng nhận lời mời không hợp lệ",
                });
            }

            if (from.toString() === to) {
                return res.status(400).json({
                    message: "Không thể gửi lời mời kết bạn cho chính mình",
                });
            }

            const userExists = await User.exists({ _id: to });
            if (!userExists) {
                return res
                    .status(404)
                    .json({ message: "Người dùng không tồn tại" });
            }

            let user = from.toString();
            let friend = to.toString();

            if (user > friend) {
                [user, friend] = [friend, user];
            }

            const [alreadyFriends, pendingRequest] = await Promise.all([
                Friend.findOne({ userId: user, friendId: friend }),
                FriendRequest.findOne({
                    $or: [
                        { from, to },
                        { from: to, to: from },
                    ],
                }),
            ]);

            if (alreadyFriends) {
                return res
                    .status(400)
                    .json({ message: "Hai người đã là bạn bè" });
            }

            if (pendingRequest) {
                if (pendingRequest.from.toString() === from.toString()) {
                    return res.status(400).json({
                        message: "Bạn đã gửi lời mời kết bạn này rồi",
                    });
                } else {
                    return res.status(400).json({
                        message: "Bạn đã nhận được lời mời kết bạn này rồi",
                    });
                }
            }

            const request = await FriendRequest.create({
                from,
                to,
                message,
            });

            return res
                .status(201)
                .json({ message: "Lời mời kết bạn đã được gửi", request });
        } catch (error) {
            console.error("Lỗi khi gửi lời mời kết bạn:", error);
            return res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }

    async acceptFriendRequest(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user._id;

            const request = await FriendRequest.findById(id);
            if (!request) {
                return res
                    .status(404)
                    .json({ message: "Lời mời kết bạn không tồn tại" });
            }

            if (request.to.toString() !== userId.toString()) {
                return res.status(403).json({
                    message: "Bạn không có quyền chấp nhận lời mời này",
                });
            }

            await Friend.create({
                userId: request.from,
                friendId: request.to,
            });

            await FriendRequest.findByIdAndDelete(id);

            const from = await User.findById(request.from)
                .select("_id displayName avatarUrl")
                .lean();

            return res.json({
                message: "Đã chấp nhận lời mời kết bạn",
                newFriend: {
                    _id: from?._id,
                    displayName: from?.displayName,
                    avatarUrl: from?.avatarUrl,
                },
            });
        } catch (error) {
            console.error("Lỗi khi chấp nhận lời mời kết bạn:", error);
            return res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }

    async declineFriendRequest(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user._id;

            const request = await FriendRequest.findById(id);
            if (!request) {
                return res
                    .status(404)
                    .json({ message: "Lời mời kết bạn không tồn tại" });
            }

            if (request.to.toString() !== userId.toString()) {
                return res.status(403).json({
                    message: "Bạn không có quyền từ chối lời mời này",
                });
            }
            await FriendRequest.findByIdAndDelete(id);
            return res.json({ message: "Đã từ chối lời mời kết bạn" });
        } catch (error) {
            console.error("Lỗi khi từ chối lời mời kết bạn:", error);
            return res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }

    async getAllFriends(req, res) {
        try {
            const userId = req.user._id;
            const friendships = await Friend.find({
                $or: [{ userId }, { friendId: userId }],
            })
                .populate("userId", "_id displayName avatarUrl username")
                .populate("friendId", "_id displayName avatarUrl username");

            if (!friendships.length) {
                return res.status(200).json({ friends: [] });
            }

            const friends = friendships.map((f) =>
                f.userId._id.toString() === userId.toString()
                    ? f.friendId
                    : f.userId,
            );
            return res.status(200).json({ friends });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách bạn bè:", error);
            return res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }

    async getFriendRequests(req, res) {
        try {
            const userId = req.user._id;
            const populateFields = "_id username displayName avatarUrl";

            const [sent, received] = await Promise.all([
                FriendRequest.find({ from: userId })
                    .populate("to", populateFields)
                    .lean(),
                FriendRequest.find({ to: userId })
                    .populate("from", populateFields)
                    .lean(),
            ]);

            return res.status(200).json({ requests: { sent, received } });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách lời mời kết bạn:", error);
            return res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }
}

export default new FriendController();
