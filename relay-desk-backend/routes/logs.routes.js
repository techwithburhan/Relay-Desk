import { Router } from 'express';
import { listLogs, deleteLog, deleteLogs, deleteAllLogs } from '../controllers/logs.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/requireAdmin.middleware.js';

const router = Router();

router.get('/', requireAuth, requireAdmin, listLogs);
router.delete('/all', requireAuth, requireAdmin, deleteAllLogs); // must be before /:id
router.delete('/:id', requireAuth, requireAdmin, deleteLog);
router.delete('/', requireAuth, requireAdmin, deleteLogs); // bulk, body: { ids }

export default router;
