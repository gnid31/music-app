import express from "express";
import {
  getSongsController,
  getSongByIdController,
  addFavoriteSongController,
  deleteFavoriteSongController,
  getFavoriteSongsController,
  getPlaybackHistoryController,
  playSongController,
} from "../controllers/songController";

const router = express.Router();

router.get("/play/:songId", playSongController);
router.get("/history", getPlaybackHistoryController);
router.get("/favorite", getFavoriteSongsController);
router.delete("/favorite", deleteFavoriteSongController);
router.post("/favorite", addFavoriteSongController);
router.get("/:id", getSongByIdController);
router.get("/", getSongsController);

export default router;
