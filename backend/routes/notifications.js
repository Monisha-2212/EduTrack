import { Router } from 'express';
import verifyToken from '../middleware/verifyToken.js';
import {
  getNotifications,
  markAsRead,
  markAllRead,
} from '../controllers/notificationController.js';

const router = Router();

// All routes are protected
router.use(verifyToken);

// GET /api/notifications?unreadOnly=true
router.get('/', getNotifications);

// PATCH /api/notifications/read-all  (must be before /:id/read)
router.patch('/read-all', markAllRead);

// PATCH /api/notifications/:id/read
router.patch('/:id/read', markAsRead);

export default router;
