import { Router } from 'express';
import { status, activate, listLicenses, generate, revoke } from '../controllers/license.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/requireAdmin.middleware.js';

const router = Router();

// Public — must work even when nobody can log in (that's the whole point
// of the /license recovery page).
router.get('/status', status);
router.post('/activate', activate);

// Admin-only management (generating a fresh key ahead of expiry, revoking, history)
router.get('/', requireAuth, requireAdmin, listLicenses);
router.post('/generate', requireAuth, requireAdmin, generate);
router.post('/:id/revoke', requireAuth, requireAdmin, revoke);

export default router;
