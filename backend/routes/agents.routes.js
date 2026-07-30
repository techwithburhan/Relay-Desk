import { Router } from 'express';
import {
  listAgents,
  agentWorkload,
  listDealers,
  createDealer,
  createAgent,
  updateAgent,
  deleteAgent,
  setDealerAccess,
  setStatusPermission,
  resetDealerPassword,
} from '../controllers/agents.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/requireAdmin.middleware.js';

const router = Router();

router.get('/', requireAuth, listAgents);
router.get('/workload', requireAuth, agentWorkload);

router.post('/', requireAuth, requireAdmin, createAgent);
router.put('/:id', requireAuth, requireAdmin, updateAgent);
router.delete('/:id', requireAuth, requireAdmin, deleteAgent);
router.patch('/:id/status-permission', requireAuth, requireAdmin, setStatusPermission);

router.get('/dealers', requireAuth, requireAdmin, listDealers);
router.post('/dealers', requireAuth, requireAdmin, createDealer);
router.patch('/:id/access', requireAuth, requireAdmin, setDealerAccess);
router.post('/:id/reset-password', requireAuth, requireAdmin, resetDealerPassword);

export default router;
