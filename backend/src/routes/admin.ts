import { Router } from 'express';
import {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  banUser,
  getAllListings,
  updateListingStatus,
  getAllReports,
  updateReportStatus,
  getRevenueStats,
} from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, authorize('ADMIN'), getDashboardStats);
router.get('/users', authenticate, authorize('ADMIN', 'MODERATOR'), getAllUsers);
router.put('/users/:id/role', authenticate, authorize('ADMIN'), updateUserRole);
router.delete('/users/:id', authenticate, authorize('ADMIN'), banUser);
router.get('/listings', authenticate, authorize('ADMIN', 'MODERATOR'), getAllListings);
router.put('/listings/:id/status', authenticate, authorize('ADMIN', 'MODERATOR'), updateListingStatus);
router.get('/reports', authenticate, authorize('ADMIN', 'MODERATOR'), getAllReports);
router.put('/reports/:id/status', authenticate, authorize('ADMIN', 'MODERATOR'), updateReportStatus);
router.get('/revenue', authenticate, authorize('ADMIN'), getRevenueStats);

export default router;
