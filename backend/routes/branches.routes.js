import { Router } from 'express';
import { listBranches, createBranch, updateBranch, deleteBranch } from '../controllers/branches.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/requireAdmin.middleware.js';

const router = Router();

router.get('/', requireAuth, listBranches);
router.post('/', requireAuth, requireAdmin, createBranch);
router.put('/:id', requireAuth, requireAdmin, updateBranch);
router.delete('/:id', requireAuth, requireAdmin, deleteBranch);

export default router;
