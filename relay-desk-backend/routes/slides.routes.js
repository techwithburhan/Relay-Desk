import { Router } from 'express';
import {
  listSlides,
  listAllSlides,
  createSlide,
  updateSlide,
  deleteSlide,
  reorderSlides,
} from '../controllers/slides.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/requireAdmin.middleware.js';

const router = Router();

// Public — the Login page needs slides before authentication
router.get('/', listSlides);

router.get('/admin', requireAuth, requireAdmin, listAllSlides);
router.post('/', requireAuth, requireAdmin, createSlide);
router.put('/reorder', requireAuth, requireAdmin, reorderSlides); // before /:id
router.put('/:id', requireAuth, requireAdmin, updateSlide);
router.delete('/:id', requireAuth, requireAdmin, deleteSlide);

export default router;
