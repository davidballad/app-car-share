import { Pool } from 'pg';
import { Notification, CreateNotificationRequest, NotificationType, NotificationTemplate } from '../models/Notification';

export class NotificationService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Create and send notification
   */
  async createNotification(notificationData: CreateNotificationRequest): Promise<Notification> {
    const query = `
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      notificationData.userId,
      notificationData.type,
      notificationData.title,
      notificationData.message,
      notificationData.data ? JSON.stringify(notificationData.data) : null
    ];

    const result = await this.pool.query(query, values);
    return this.mapRowToNotification(result.rows[0]);
  }

  /**
   * Get notifications for user
   */
  async getUserNotifications(userId: string, limit: number = 20): Promise<Notification[]> {
    const query = `
      SELECT * FROM notifications 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;

    const result = await this.pool.query(query, [userId, limit]);
    return result.rows.map(row => this.mapRowToNotification(row));
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const query = `
      UPDATE notifications 
      SET read = true 
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;

    const result = await this.pool.query(query, [notificationId, userId]);
    return result.rows.length > 0;
  }

  /**
   * Get notification templates
   */
  static getTemplate(type: NotificationType, data?: any): NotificationTemplate {
    switch (type) {
      case 'booking_confirmed':
        return {
          title: 'Reserva Confirmada',
          message: `Tu reserva para ${data?.route || 'el viaje'} ha sido confirmada.`
        };

      case 'booking_cancelled':
        return {
          title: 'Reserva Cancelada',
          message: `La reserva para ${data?.route || 'el viaje'} ha sido cancelada.`
        };

      case 'trip_reminder':
        return {
          title: 'Recordatorio de Viaje',
          message: `Tu viaje ${data?.route || ''} sale en 2 horas. ¡Prepárate!`
        };

      case 'verification_approved':
        return {
          title: 'Verificación Aprobada',
          message: 'Tu verificación de antecedentes ha sido aprobada.'
        };

      case 'verification_rejected':
        return {
          title: 'Verificación Rechazada',
          message: 'Tu verificación de antecedentes ha sido rechazada. Revisa los documentos.'
        };

      case 'system_update':
        return {
          title: 'Actualización del Sistema',
          message: data?.message || 'Hay una nueva actualización disponible.'
        };

      default:
        return {
          title: 'Notificación',
          message: 'Tienes una nueva notificación.'
        };
    }
  }

  /**
   * Send booking confirmation notification
   */
  async sendBookingConfirmation(userId: string, tripData: any): Promise<void> {
    const template = NotificationService.getTemplate('booking_confirmed', {
      route: `${tripData.originCity} → ${tripData.destinationCity}`
    });

    await this.createNotification({
      userId,
      type: 'booking_confirmed',
      title: template.title,
      message: template.message,
      data: tripData
    });
  }

  /**
   * Send trip reminder notification
   */
  async sendTripReminder(userId: string, tripData: any): Promise<void> {
    const template = NotificationService.getTemplate('trip_reminder', {
      route: `${tripData.originCity} → ${tripData.destinationCity}`
    });

    await this.createNotification({
      userId,
      type: 'trip_reminder',
      title: template.title,
      message: template.message,
      data: tripData
    });
  }

  private mapRowToNotification(row: any): Notification {
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type as NotificationType,
      title: row.title,
      message: row.message,
      data: row.data ? JSON.parse(row.data) : null,
      read: row.read,
      createdAt: row.created_at
    };
  }
}