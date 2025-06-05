import express from "express";
import {
  addSongToPlaylistController,
  createPlaylistController,
  deletePlaylistController,
  deleteSongToPlaylistController,
  updatePlaylistNameController,
} from "../controllers/playlistController";

const router = express.Router();

// Route để tạo playlist
// Sử dụng middlewar để bảo vệ route này
router.delete("/delete/:playlistId", deleteSongToPlaylistController)
router.delete("/:playlistId", deletePlaylistController);
router.post("/:playlistId", addSongToPlaylistController);
router.put("/:playlistId", updatePlaylistNameController);
router.post("/", createPlaylistController);

export default router;
