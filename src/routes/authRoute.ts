import express from "express";
import { registerUserController, loginUserController, logoutUserController } from "../controllers/authController";
import { validateRegistrationInput, checkExistingUser, validateLoginInput } from "../validations/authValidation";
import authenticateToken from "../middlewares/authMiddleware";

const router = express.Router();

// The path here is relative to where this router is used in server
router.post('/register', validateRegistrationInput, checkExistingUser, registerUserController);
router.post('/login', validateLoginInput, loginUserController);
router.post('/logout', authenticateToken, logoutUserController);

export default router;
