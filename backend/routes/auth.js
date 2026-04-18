import { Router } from 'express';
import { signup, login, logout, getMe, checkEmail } from '../controllers/authController.js';
import verifyToken from '../middleware/verifyToken.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', verifyToken, getMe);
router.get('/check-email', checkEmail);

export default router;
