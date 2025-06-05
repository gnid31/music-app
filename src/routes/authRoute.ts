import express from "express";
import { registerUserController, loginUserController, logoutUserController } from "../controllers/authController";
import { validateRegistrationInput, checkExistingUser, validateLoginInput } from "../validations/authValidation";
import authenticateToken from "../middlewares/authMiddleware";

const router = express.Router();

// The path here is relative to where this router is used in server
router.post('/register', validateRegistrationInput, checkExistingUser, registerUserController);
router.post('/login', validateLoginInput, loginUserController);
router.post('/logout', authenticateToken, logoutUserController);


// router.get('/profile', authenticateToken, (req, res) => {
//   // Nếu đến được đây nghĩa là token hợp lệ và không bị blacklist
//   res.status(200).json({ message: 'Welcome to your profile!', user: res.locals.user });
// });

export default router;
