import { Router } from 'express';
import { addFavorite, removeFavorite, getMyFavorites, checkFavorite } from '../controllers/favoritesController';
import { authenticate } from '../middleware/auth';
import { validateParams } from '../middleware/validate';
import { listingIdParamSchema } from '../utils/validations';

const router = Router();

router.post('/:listingId', authenticate, validateParams(listingIdParamSchema), addFavorite);
router.delete('/:listingId', authenticate, validateParams(listingIdParamSchema), removeFavorite);
router.get('/', authenticate, getMyFavorites);
router.get('/:listingId/check', authenticate, validateParams(listingIdParamSchema), checkFavorite);

export default router;
