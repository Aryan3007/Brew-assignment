import express from 'express';
import { register, login, logout, getMe, googleLogin } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/logout', logout);
router.get('/me', protect, getMe);

export default router;
