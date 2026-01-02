import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getDashboardStats, getAllOrders, getAllUsers } from '../controllers/admin.controller';

const router = Router();

// All routes require authentication and ADMIN role
router.use(authenticate, authorize('ADMIN'));

router.get('/stats', getDashboardStats);
router.get('/orders', getAllOrders);
router.get('/users', getAllUsers);

export default router;
