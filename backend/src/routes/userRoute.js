import express from "express";
import userController from "../controllers/userController.js";

const router = express.Router();

router.get("/me", userController.authMe);
router.get("/test", userController.test);

export default router;
