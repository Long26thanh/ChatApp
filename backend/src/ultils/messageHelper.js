class MessageHelper {
    static async updateConversationAfterMessage(
        conversation,
        message,
        senderId,
    ) {
        try {
            conversation.set({
                seenBy: [],
                lastMessageAt: message.createdAt,
                lastMessage: {
                    _id: message._id,
                    content: message.content,
                    senderId,
                    createdAt: message.createdAt,
                },
            });

            conversation.participants.forEach((p) => {
                const memberId = p.userId.toString();
                const isSender = memberId === senderId.toString();
                const prevCount = conversation.unreadCounts.get(memberId) || 0;

                conversation.unreadCounts.set(
                    memberId,
                    isSender ? 0 : prevCount + 1,
                );
            });
        } catch (error) {
            console.error(
                "Lỗi khi cập nhật cuộc trò chuyện sau khi gửi tin nhắn:",
                error,
            );
        }
    }

    static async emitNewMessage(io, conversation, message, onlineUsers) {
        try {
            const unreadCounts =
                conversation.unreadCounts instanceof Map
                    ? Object.fromEntries(conversation.unreadCounts)
                    : (conversation.unreadCounts ?? {});

            const payload = {
                message,
                conversation: {
                    _id: conversation._id.toString(),
                    lastMessage: conversation.lastMessage,
                    lastMessageAt: conversation.lastMessageAt,
                },
                unreadCounts,
            };

            io.to(conversation._id.toString()).emit("new-message", payload);

            // Also emit directly to online participants in case a newly created
            // conversation room has not been joined yet.
            if (onlineUsers instanceof Map) {
                const socketIds = new Set();
                (conversation.participants ?? []).forEach((participant) => {
                    const memberId = participant?.userId?.toString?.();
                    if (!memberId) return;
                    const socketId = onlineUsers.get(memberId);
                    if (socketId) socketIds.add(socketId);
                });

                socketIds.forEach((socketId) => {
                    io.to(socketId).emit("new-message", payload);
                });
            }
        } catch (error) {
            console.error("Lỗi khi phát tin nhắn mới qua Socket.IO:", error);
        }
    }
}

export default MessageHelper;
