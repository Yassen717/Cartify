import { Router } from 'express';
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    addOrderTracking,
} from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import {
    createOrderSchema,
    updateOrderStatusSchema,
    addOrderTrackingSchema,
} from '../utils/validation.schemas';

const router = Router();

// Customer routes - require authentication
router.post('/', authenticate, validateBody(createOrderSchema), createOrder);
router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrderById);

// Admin routes - require authentication and admin role
router.put('/:id/status', authenticate, authorize('ADMIN'), validateBody(updateOrderStatusSchema), updateOrderStatus);
router.post('/:id/tracking', authenticate, authorize('ADMIN'), validateBody(addOrderTrackingSchema), addOrderTracking);

export default router;
