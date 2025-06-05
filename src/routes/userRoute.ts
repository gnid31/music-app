import express from "express";
import { getProfileController } from "../controllers/userController";

const router = express.Router();

router.get("/", getProfileController);

export default router;
