import express from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/authController";
import { validateRegistrationInput, checkExistingUser, validateLoginInput } from "../validations/authValidation";
import authenticateToken from '../middlewares/authMiddleware';

const router = express.Router();

// The path here is relative to where this router is used in server
router.post('/register', validateRegistrationInput, checkExistingUser, registerUser);
router.post('/login', validateLoginInput, loginUser);
router.post('/logout', authenticateToken, logoutUser);


router.get('/profile', authenticateToken, (req, res) => {
  // Nếu đến được đây nghĩa là token hợp lệ và không bị blacklist
  res.status(200).json({ message: 'Welcome to your profile!', user: res.locals.user });
});

export default router;
