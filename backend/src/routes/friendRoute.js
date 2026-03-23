import express from "express";
import FriendController from "../controllers/friendController.js";

const router = express.Router();

// Lấy danh sách bạn bè và lời mời kết bạn
router.get("/", FriendController.getAllFriends);
router.get("/requests", FriendController.getFriendRequests);

// Gửi lời mời kết bạn, chấp nhận hoặc từ chối lời mời
router.post("/requests/", FriendController.sendFriendRequest);
router.post("/requests/:id/accept", FriendController.acceptFriendRequest);
router.post("/requests/:id/decline", FriendController.declineFriendRequest);

export default router;
