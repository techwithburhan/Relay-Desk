import { Router } from 'express';
import {
  listDownloads,
  listAllDownloads,
  createDownload,
  updateDownload,
  deleteDownload,
} from '../controllers/downloads.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/requireAdmin.middleware.js';

const router = Router();

router.get('/', requireAuth, listDownloads);
router.get('/admin', requireAuth, requireAdmin, listAllDownloads);
router.post('/', requireAuth, requireAdmin, createDownload);
router.put('/:id', requireAuth, requireAdmin, updateDownload);
router.delete('/:id', requireAuth, requireAdmin, deleteDownload);

export default router;
