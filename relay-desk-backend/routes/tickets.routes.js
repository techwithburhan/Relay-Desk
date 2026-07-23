import { Router } from 'express';
import {
  listTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  addComment,
} from '../controllers/tickets.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { scopeToBranch } from '../middleware/scopeToBranch.middleware.js';
import { requireAdmin } from '../middleware/requireAdmin.middleware.js';

const router = Router();

router.get('/', requireAuth, scopeToBranch, listTickets);
router.get('/:ticketNumber', requireAuth, scopeToBranch, getTicket);
router.post('/', requireAuth, scopeToBranch, createTicket);
router.patch('/:ticketNumber', requireAuth, requireAdmin, updateTicket);
router.delete('/:ticketNumber', requireAuth, requireAdmin, deleteTicket);
router.post('/:ticketNumber/comments', requireAuth, addComment);

export default router;
