export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

export type NotificationType = 
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'trip_reminder'
  | 'verification_approved'
  | 'verification_rejected'
  | 'system_update';

export interface CreateNotificationRequest {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
}

export interface NotificationTemplate {
  title: string;
  message: string;
}