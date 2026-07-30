import { Router } from 'express';
import { listDepartments, createDepartment, updateDepartment, deleteDepartment } from '../controllers/departments.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/requireAdmin.middleware.js';

const router = Router();

router.get('/', requireAuth, listDepartments);
router.post('/', requireAuth, requireAdmin, createDepartment);
router.put('/:id', requireAuth, requireAdmin, updateDepartment);
router.delete('/:id', requireAuth, requireAdmin, deleteDepartment);

export default router;
