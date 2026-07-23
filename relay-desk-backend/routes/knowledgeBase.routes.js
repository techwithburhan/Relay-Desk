import { Router } from 'express';
import { listArticles, getArticle } from '../controllers/knowledgeBase.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', requireAuth, listArticles);
router.get('/:id', requireAuth, getArticle);

export default router;
