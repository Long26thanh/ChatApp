import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

class ConversationController {
    async createConversation(req, res) {
        try {
            const { type, name, member } = req.body;
            const userId = req.user._id;
            if (
                !type ||
                (type === "group" && !name) ||
                !member ||
                !Array.isArray(member) ||
                member.length === 0
            ) {
                return res
                    .status(400)
                    .json({ message: "Tên nhóm hoặc thành viên không hợp lệ" });
            }

            let conversation;

            if (type === "direct") {
                const recipientId = member[0];
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
                }

                await conversation.save();
            }

            if (type === "group") {
                conversation = new Conversation({
                    type: "group",
                    participants: [
                        { userId },
                        ...member.map((id) => ({ userId: id })),
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

            await conversation.populate(
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
            );

            return res.status(201).json({ conversation });
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

                return {
                    ...conv.toObject(),
                    unreadCounts: conv.unreadCounts || {},
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
}

export default new ConversationController();
