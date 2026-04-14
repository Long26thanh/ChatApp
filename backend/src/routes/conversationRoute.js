import express from "express";
import ConversationController from "../controllers/conversationController.js";
import { checkFriendship } from "../middlewares/friendMiddleware.js";

const router = express.Router();

router.post("/", checkFriendship, ConversationController.createConversation);
router.get("/", ConversationController.getConversations);
router.get("/:conversationId/messages", ConversationController.getMessages);
router.patch("/:conversationId/seen", ConversationController.markAsSeen);

export default router;
