import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const notificationController = new NotificationController();

// All notification routes require authentication
router.use(authenticateToken);

router.get('/', notificationController.getUserNotifications.bind(notificationController));
router.put('/:id/read', notificationController.markAsRead.bind(notificationController));

export default router;