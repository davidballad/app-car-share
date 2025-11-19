import { Request, Response } from 'express';
import { NotificationService } from '../services/NotificationService';
import { getPool } from '../config/database';

export class NotificationController {
  private notificationService: NotificationService | null = null;

  constructor() {
    try {
      this.notificationService = new NotificationService(getPool());
    } catch (error) {
      console.warn('Database pool not initialized, some operations may fail');
    }
  }

  /**
   * Get user notifications
   * GET /api/notifications
   */
  async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          }
        });
        return;
      }

      if (!this.notificationService) {
        res.json({
          success: true,
          data: {
            notifications: []
          }
        });
        return;
      }

      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const notifications = await this.notificationService.getUserNotifications(userId, limit);

      res.json({
        success: true,
        data: {
          notifications
        }
      });

    } catch (error) {
      console.error('Error getting notifications:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  /**
   * Mark notification as read
   * PUT /api/notifications/:id/read
   */
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const notificationId = req.params.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          }
        });
        return;
      }

      if (!this.notificationService) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOTIFICATION_NOT_FOUND',
            message: 'Notificación no encontrada'
          }
        });
        return;
      }

      const updated = await this.notificationService.markAsRead(notificationId, userId);
      
      if (!updated) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOTIFICATION_NOT_FOUND',
            message: 'Notificación no encontrada'
          }
        });
        return;
      }

      res.json({
        success: true,
        message: 'Notificación marcada como leída'
      });

    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }
}