import express from "express";
import {
  addSongToPlaylistController,
  createPlaylistController,
  deletePlaylistController,
  deleteSongToPlaylistController,
  getPlaylistsController,
  getSongsPlaylistController,
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
router.get("/:id", getPlaylistsController);
router.get("/songs/:playlistId", getSongsPlaylistController);
export default router;
