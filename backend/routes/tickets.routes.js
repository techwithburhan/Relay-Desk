import { Router } from 'express';
import {
  listTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  addComment,
  requestTransfer,
} from '../controllers/tickets.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { scopeToBranch } from '../middleware/scopeToBranch.middleware.js';
import { requireAdmin } from '../middleware/requireAdmin.middleware.js';
import { requireAdminOrDealer } from '../middleware/requireAdminOrDealer.middleware.js';

const router = Router();

router.get('/', requireAuth, scopeToBranch, listTickets);
router.get('/:ticketNumber', requireAuth, scopeToBranch, getTicket);
router.post('/', requireAuth, scopeToBranch, createTicket);
router.patch('/:ticketNumber', requireAuth, scopeToBranch, requireAdminOrDealer, updateTicket);
router.delete('/:ticketNumber', requireAuth, requireAdmin, deleteTicket);
router.post('/:ticketNumber/comments', requireAuth, addComment);
router.post('/:ticketNumber/transfer', requireAuth, scopeToBranch, requireAdminOrDealer, requestTransfer);

export default router;
