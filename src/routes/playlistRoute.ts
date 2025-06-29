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
router.delete("/:playlistId/songs/:songId", deleteSongToPlaylistController);
router.delete("/:playlistId", deletePlaylistController);
router.post("/:playlistId/songs", addSongToPlaylistController);
router.put("/:playlistId", updatePlaylistNameController);
router.post("/", createPlaylistController);
router.get("/", getPlaylistsController);
router.get("/:playlistId/songs", getSongsPlaylistController);
export default router;
