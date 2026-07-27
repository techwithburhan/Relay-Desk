import { Router } from 'express';
import {
  listArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
} from '../controllers/knowledgeBase.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/requireAdmin.middleware.js';

const router = Router();

router.get('/', requireAuth, listArticles);
router.get('/:id', requireAuth, getArticle);
router.post('/', requireAuth, requireAdmin, createArticle);
router.put('/:id', requireAuth, requireAdmin, updateArticle);
router.delete('/:id', requireAuth, requireAdmin, deleteArticle);

export default router;
