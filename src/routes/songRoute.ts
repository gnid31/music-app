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
  getTopGenresByListensController,
} from "../controllers/songController";

const router = express.Router();

router.get("/play/:songId", playSongController);
router.get("/history", getPlaybackHistoryController);
router.get("/favorites", getFavoriteSongsController);
router.delete("/favorites", deleteFavoriteSongController);
router.post("/favorites", addFavoriteSongController);
router.get("/top-listens", getTopSongsByListensController);
router.get("/genres/top-listens", getTopGenresByListensController); // New route for top genres by listens
router.get("/:id", getSongByIdController);
router.get("/", getSongsController);

export default router;
