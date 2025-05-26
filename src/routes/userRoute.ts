import express from "express";
import { getProfileController } from "../controllers/userController";
import authenticateToken from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/profile", authenticateToken, getProfileController);

export default router;
