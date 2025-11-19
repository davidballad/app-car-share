import { NotificationService } from '../../services/NotificationService';

describe('NotificationService', () => {
  describe('getTemplate', () => {
    it('should return booking confirmation template', () => {
      const template = NotificationService.getTemplate('booking_confirmed', {
        route: 'Quito → Guayaquil'
      });
      
      expect(template.title).toBe('Reserva Confirmada');
      expect(template.message).toContain('Quito → Guayaquil');
    });

    it('should return trip reminder template', () => {
      const template = NotificationService.getTemplate('trip_reminder', {
        route: 'Cuenca → Loja'
      });
      
      expect(template.title).toBe('Recordatorio de Viaje');
      expect(template.message).toContain('Cuenca → Loja');
    });

    it('should return default template for unknown type', () => {
      const template = NotificationService.getTemplate('unknown' as any);
      
      expect(template.title).toBe('Notificación');
      expect(template.message).toBe('Tienes una nueva notificación.');
    });
  });
});