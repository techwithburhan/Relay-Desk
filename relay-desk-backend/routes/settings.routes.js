import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/requireAdmin.middleware.js';

const router = Router();

// Public read — the Login page needs branding (logo, portal name) before
// a user has authenticated.
router.get('/', getSettings);
router.put('/', requireAuth, requireAdmin, updateSettings);

export default router;
