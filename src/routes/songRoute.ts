import express from "express";
import {
  getAllSongsController,
  getSongController,
} from "../controllers/songController";

const router = express.Router();

router.get("/:id", getSongController);
router.get("/", getAllSongsController);

export default router;
