import express from "express";
import {
  getSongsController,
  getSongByIdController,
  addFavoriteSongController,
  deleteFavoriteSongController,
  getFavoriteSongsController,
  getPlaybackHistoryController,
  playSongController,
  getTopSongsByListensController,
  getTopSongsByGenreController,
} from "../controllers/songController";

const router = express.Router();

router.post("/:songId/play", playSongController);
router.get("/history", getPlaybackHistoryController);
router.get("/favorites", getFavoriteSongsController);
router.delete("/favorites/:songId", deleteFavoriteSongController);
router.post("/favorites", addFavoriteSongController);
router.get("/top-listens", getTopSongsByListensController);
router.get("/genres/:genreName/top-listens", getTopSongsByGenreController);
router.get("/:songId", getSongByIdController);
router.get("/", getSongsController);

export default router;
