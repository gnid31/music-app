import express from "express";
import {
  getAllSongsController,
  getSongByIdController,
} from "../controllers/songController";

const router = express.Router();

router.get("/:id", getSongByIdController);
router.get("/", getAllSongsController);

export default router;
