import express from 'express';
import authRoute from './authRoute'
import songRoute from './songRoute'

const router = express.Router();

router.use('/auth', authRoute);
router.use('/song', songRoute);

export default router;
