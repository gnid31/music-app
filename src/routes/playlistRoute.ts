// src/routes/playlistRoute.ts
import express from "express";
import { createPlaylistController, deletePlaylistController, updatePlaylistNameController } from "../controllers/playlistController";
import authenticateToken from "../middlewares/authMiddleware"; // Import middleware xác thực

const router = express.Router();

// Route để tạo playlist
// Sử dụng middleware authenticateToken để bảo vệ route này
router.post("/create", authenticateToken, createPlaylistController);
router.put("/update/:id", authenticateToken, updatePlaylistNameController);
router.delete("/delete/:id", authenticateToken, deletePlaylistController)
export default router;