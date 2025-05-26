import express from "express";
import authRoute from "./authRoute";
import songRoute from "./songRoute";
import playlistRoute from "./playlistRoute";
import userRoute from "./userRoute";

const router = express.Router();
router.get("/hello", (req, res) => {
  res.send("Hello World");
});
router.use("/auth", authRoute);
router.use("/song", songRoute);
router.use("/playlist", playlistRoute);
router.use("/user", userRoute);

export default router;
