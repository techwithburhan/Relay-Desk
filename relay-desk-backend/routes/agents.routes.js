import { Router } from 'express';
import {
  listAgents,
  agentWorkload,
  listDealers,
  createDealer,
  setDealerAccess,
  resetDealerPassword,
} from '../controllers/agents.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/requireAdmin.middleware.js';

const router = Router();

router.get('/', requireAuth, listAgents);
router.get('/workload', requireAuth, agentWorkload);

// Dealer Mapping (point 5) — admin only
router.get('/dealers', requireAuth, requireAdmin, listDealers);
router.post('/dealers', requireAuth, requireAdmin, createDealer);
router.patch('/:id/access', requireAuth, requireAdmin, setDealerAccess);
router.post('/:id/reset-password', requireAuth, requireAdmin, resetDealerPassword);

export default router;
