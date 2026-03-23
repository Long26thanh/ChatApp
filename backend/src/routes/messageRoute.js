import express from "express";
import messageController from "../controllers/messageController.js";
import {
    checkFriendship,
    checkGroupMembership,
} from "../middlewares/friendMiddleware.js";

const router = express.Router();

router.post("/direct", checkFriendship, messageController.sendDirectMessage);
router.post("/group", checkGroupMembership, messageController.sendGroupMessage);

export default router;
