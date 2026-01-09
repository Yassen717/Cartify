import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getDashboardStats, getAllOrders, getAllUsers } from '../controllers/admin.controller';

const router = Router();

// All routes require authentication (no ADMIN role requirement)
router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/orders', getAllOrders);
router.get('/users', getAllUsers);

export default router;
