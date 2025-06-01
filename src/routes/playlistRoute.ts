// src/routes/playlistRoute.ts
import express from "express";
import {
  addSongToPlaylistController,
  createPlaylistController,
  deletePlaylistController,
  updatePlaylistNameController,
} from "../controllers/playlistController";
import authenticateToken from "../middlewares/authMiddleware"; // Import middleware xác thực

const router = express.Router();

// Route để tạo playlist
// Sử dụng middleware authenticateToken để bảo vệ route này
router.post("/", authenticateToken, createPlaylistController);
router.delete("/:id", authenticateToken, deletePlaylistController);
router.post("/:playlistId", authenticateToken, addSongToPlaylistController);
router.put("/:id", authenticateToken, updatePlaylistNameController);

export default router;
