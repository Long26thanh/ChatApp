import express from "express";
import UserController from "../controllers/userController.js";

const router = express.Router();

router.get("/me", UserController.authMe);
router.get("/test", UserController.test);

export default router;
