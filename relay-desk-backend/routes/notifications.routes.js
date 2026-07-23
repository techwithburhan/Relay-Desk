import { Router } from 'express';
import { listNotifications, markRead, markAllRead } from '../controllers/notifications.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', requireAuth, listNotifications);
router.patch('/read-all', requireAuth, markAllRead); // before /:id/read
router.patch('/:id/read', requireAuth, markRead);

export default router;
