import { Router } from 'express';
import { listCustomers, createCustomer, updateCustomer, importCustomers } from '../controllers/customers.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { scopeToBranch } from '../middleware/scopeToBranch.middleware.js';
import { requireAdmin } from '../middleware/requireAdmin.middleware.js';

const router = Router();

router.get('/', requireAuth, scopeToBranch, listCustomers);
router.post('/', requireAuth, scopeToBranch, createCustomer);
router.put('/:id', requireAuth, updateCustomer);
router.post('/import', requireAuth, requireAdmin, importCustomers);

export default router;
