import express from 'express';
import authRoute from './authRoute'
import songRoute from './songRoute'
import playlistRoute from './playlistRoute'
const router = express.Router();

router.use('/auth', authRoute);
router.use('/song', songRoute);
router.use('/playlist', playlistRoute);

export default router;
