import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { io } from "../socket/index.js";

class ConversationController {
    async createConversation(req, res) {
        try {
            const { type, name, memberIds } = req.body;
            const userId = req.user._id;
            if (
                !type ||
                (type === "group" && !name) ||
                !memberIds ||
                !Array.isArray(memberIds) ||
                memberIds.length === 0
            ) {
                return res
                    .status(400)
                    .json({ message: "Tên nhóm hoặc thành viên không hợp lệ" });
            }

            let conversation;

            if (type === "direct") {
                const recipientId = memberIds[0];
                const existingConversation = await Conversation.findOne({
                    type: "direct",
                    "participants.userId": { $all: [userId, recipientId] },
                });

                if (!existingConversation) {
                    conversation = new Conversation({
                        type: "direct",
                        participants: [{ userId }, { userId: recipientId }],
                        lastMessageAt: new Date(),
                    });

                    await conversation.save();
                } else {
                    conversation = existingConversation;
                }
            }

            if (type === "group") {
                conversation = new Conversation({
                    type: "group",
                    participants: [
                        { userId },
                        ...memberIds.map((id) => ({ userId: id })),
                    ],
                    group: {
                        name,
                        createdBy: userId,
                    },
                    lastMessageAt: new Date(),
                });

                await conversation.save();
            }

            if (!conversation) {
                return res
                    .status(400)
                    .json({ message: "Conversation type không hợp lệ" });
            }

            await conversation.populate([
                {
                    path: "participants.userId",
                    select: "displayName avatarUrl",
                },
                {
                    path: "seenBy",
                    select: "displayName avatarUrl",
                },
                {
                    path: "lastMessage.senderId",
                    select: "displayName avatarUrl",
                },
            ]);

            const participants = (conv.participants || []).map((p) => ({
                _id: p.userId?._id,
                displayName: p.userId?.displayName,
                avatarUrl: p.userId?.avatarUrl ?? null,
                joinedAt: p.joinedAt,
            }));

            const formatted = {
                ...conversation.toObject(),
                participants,
            };

            return res.status(201).json({ conversation: formatted });
        } catch (error) {
            console.error("Lỗi khi tạo cuộc trò chuyện:", error);
            return res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }

    async getConversations(req, res) {
        try {
            const userId = req.user._id;
            const conversations = await Conversation.find({
                "participants.userId": userId,
            })
                .sort({ lastMessageAt: -1, updatedAt: -1 })
                .populate({
                    path: "participants.userId",
                    select: "displayName avatarUrl",
                })
                .populate({
                    path: "lastMessage.senderId",
                    select: "displayName avatarUrl",
                })
                .populate({
                    path: "seenBy",
                    select: "displayName avatarUrl",
                });

            const formatted = conversations.map((conv) => {
                const participants = (conv.participants || []).map((p) => ({
                    _id: p.userId?._id,
                    displayName: p.userId?.displayName,
                    avatarUrl: p.userId?.avatarUrl ?? null,
                    joinedAt: p.joinedAt,
                }));

                const seenBy = (conv.seenBy || []).map((u) => ({
                    _id: u?._id?.toString?.() ?? u?.toString?.(),
                    displayName: u?.displayName,
                    avatarUrl: u?.avatarUrl ?? null,
                }));

                const sender = conv.lastMessage?.senderId;
                const senderId =
                    sender?._id?.toString?.() ?? sender?.toString?.() ?? "";

                const lastMessage = conv.lastMessage
                    ? {
                          _id: conv.lastMessage._id,
                          content: conv.lastMessage.content,
                          createdAt: conv.lastMessage.createdAt,
                          sender: {
                              _id: senderId,
                              displayName: sender?.displayName ?? "",
                              avatarUrl: sender?.avatarUrl ?? null,
                          },
                      }
                    : null;

                const unreadCounts =
                    conv.unreadCounts instanceof Map
                        ? Object.fromEntries(conv.unreadCounts)
                        : (conv.unreadCounts ?? {});

                return {
                    ...conv.toObject(),
                    unreadCounts,
                    seenBy,
                    lastMessage,
                    participants,
                };
            });
            return res.status(200).json({ conversations: formatted });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách cuộc trò chuyện:", error);
            return res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }

    async getMessages(req, res) {
        try {
            const { conversationId } = req.params;
            const { limit = 50, cursor } = req.query;

            const query = { conversationId };
            if (cursor) {
                query.createdAt = { $lt: new Date(cursor) };
            }

            let messages = await Message.find(query)
                .sort({ createdAt: -1 })
                .limit(Number(limit) + 1);

            let nextCursor = null;

            if (messages.length > Number(limit)) {
                const nextMessage = messages[messages.length - 1];
                nextCursor = nextMessage.createdAt.toISOString();
                messages.pop();
            }

            messages = messages.reverse();

            return res.status(200).json({
                messages,
                nextCursor,
            });
        } catch (error) {
            console.error("Lỗi khi lấy tin nhắn:", error);
            return res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }

    async getUserConversationsForSocketIO(userId) {
        try {
            const conversations = await Conversation.find(
                {
                    "participants.userId": userId,
                },
                { _id: 1 },
            );
            return conversations.map((conv) => conv._id.toString());
        } catch (error) {
            console.error(
                "Lỗi khi lấy danh sách cuộc trò chuyện cho Socket.IO:",
                error,
            );
            return [];
        }
    }

    async markAsSeen(req, res) {
        try {
            const { conversationId } = req.params;
            const userId = req.user._id;
            const conversation = await Conversation.findById(conversationId);

            if (!conversation) {
                return res
                    .status(404)
                    .json({ message: "Cuộc trò chuyện không tồn tại" });
            }

            const lastMessage = conversation.lastMessage;
            if (!lastMessage) {
                return res.status(400).json({
                    message: "Không có tin nhắn nào để đánh dấu đã xem",
                });
            }

            const lastSenderId = lastMessage.senderId?.toString();
            if (lastSenderId === userId.toString()) {
                return res.status(400).json({
                    message: "Bạn không cần đánh dấu tin nhắn là đã xem",
                });
            }

            const updated = await Conversation.findOneAndUpdate(
                { _id: conversationId },
                {
                    $addToSet: { seenBy: userId },
                    $set: {
                        [`unreadCounts.${userId.toString()}`]: 0,
                    },
                },
                { new: true },
            );

            if (!updated) {
                return res
                    .status(404)
                    .json({ message: "Không tìm thấy cuộc trò chuyện" });
            }

            await updated.populate({
                path: "seenBy",
                select: "displayName avatarUrl",
            });

            const unreadCounts =
                updated.unreadCounts instanceof Map
                    ? Object.fromEntries(updated.unreadCounts)
                    : (updated.unreadCounts ?? {});

            const seenBy = (updated.seenBy ?? []).map((seenUser) => ({
                _id: seenUser?._id?.toString?.() ?? seenUser?.toString?.(),
                displayName: seenUser?.displayName,
                avatarUrl: seenUser?.avatarUrl ?? null,
            }));

            io.to(conversationId).emit("read-message", {
                conversation: {
                    _id: conversationId,
                    seenBy,
                    unreadCounts,
                    lastMessage: updated.lastMessage,
                    lastMessageAt: updated.lastMessageAt,
                },
            });

            return res.status(200).json({
                message: "Đã đánh dấu là đã xem",
                seenBy,
                myUnreadCount: unreadCounts[userId.toString()] ?? 0,
            });
        } catch (error) {
            console.error("Lỗi khi đánh dấu đã xem:", error);
            return res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }
}

export default new ConversationController();
