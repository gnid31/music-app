import express from "express";
import {
  getSongsController,
  getSongByIdController,
} from "../controllers/songController";
import authenticateToken from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/:id", authenticateToken, getSongByIdController);
router.get("/", authenticateToken, getSongsController);
export default router;
