import { Router } from 'express';
import { stats, priorityVolume, trend, ticketsByBranch } from '../controllers/reports.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { scopeToBranch } from '../middleware/scopeToBranch.middleware.js';

const router = Router();

router.get('/stats', requireAuth, stats);
router.get('/priority-volume', requireAuth, priorityVolume);
router.get('/trend', requireAuth, trend);
router.get('/tickets-by-branch', requireAuth, scopeToBranch, ticketsByBranch);

export default router;
