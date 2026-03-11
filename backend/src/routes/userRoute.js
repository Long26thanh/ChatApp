import express from "express";
import userController from "../controllers/userController.js";

const router = express.Router();

router.get("/me", userController.authMe);

export default router;
