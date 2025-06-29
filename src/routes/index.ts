import express from "express";
import authRoute from "./authRoute";
import songRoute from "./songRoute";
import playlistRoute from "./playlistRoute";
import userRoute from "./userRoute";
import authenticateToken from "../middlewares/authMiddleware";

const router = express.Router();
router.get("/hello", (req, res) => {
  res.send("Hello World");
});
router.use("/auth", authRoute);
router.use(authenticateToken)
router.use("/songs", songRoute);
router.use("/playlists", playlistRoute);
router.use("/users", userRoute);

export default router;
