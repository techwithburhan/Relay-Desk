import { Router } from 'express';
import { listPendingTransfers, acceptTransfer, rejectTransfer } from '../controllers/tickets.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdminOrDealer } from '../middleware/requireAdminOrDealer.middleware.js';

const router = Router();

router.get('/pending', requireAuth, requireAdminOrDealer, listPendingTransfers);
router.post('/:id/accept', requireAuth, requireAdminOrDealer, acceptTransfer);
router.post('/:id/reject', requireAuth, requireAdminOrDealer, rejectTransfer);

export default router;
