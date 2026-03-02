import { Router } from 'express';
import {
  createListing,
  getListing,
  searchListings,
  getMyListings,
  updateListing,
  deleteListing,
  getFeaturedListings,
} from '../controllers/listingsController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate, validateParams, validateQuery } from '../middleware/validate';
import { createListingSchema, updateListingSchema, searchListingsSchema, uuidSchema } from '../utils/validations';

const router = Router();

router.post('/', authenticate, validate(createListingSchema), createListing);
router.get('/search', optionalAuth, validateQuery(searchListingsSchema), searchListings);
router.get('/featured', getFeaturedListings);
router.get('/my', authenticate, getMyListings);
router.get('/:id', optionalAuth, validateParams(uuidSchema), getListing);
router.put('/:id', authenticate, validate(uuidSchema), validate(updateListingSchema), updateListing);
router.delete('/:id', authenticate, validateParams(uuidSchema), deleteListing);

export default router;
