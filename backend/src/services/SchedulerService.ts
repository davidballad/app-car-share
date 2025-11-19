import { Pool } from 'pg';
import { NotificationService } from './NotificationService';

export class SchedulerService {
  private pool: Pool;
  private notificationService: NotificationService;

  constructor(pool: Pool) {
    this.pool = pool;
    this.notificationService = new NotificationService(pool);
  }

  /**
   * Send trip reminders for trips departing in 2 hours
   */
  async sendTripReminders(): Promise<void> {
    try {
      // Get trips departing in approximately 2 hours
      const twoHoursFromNow = new Date();
      twoHoursFromNow.setHours(twoHoursFromNow.getHours() + 2);
      
      const oneHourFromNow = new Date();
      oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);

      const query = `
        SELECT DISTINCT
          t.id, t.driver_id, t.origin_city, t.destination_city, 
          t.departure_date, t.departure_time,
          b.passenger_id
        FROM trips t
        JOIN bookings b ON t.id = b.trip_id
        WHERE t.status = 'active'
          AND b.status = 'confirmed'
          AND t.departure_date = CURRENT_DATE
          AND t.departure_time BETWEEN $1 AND $2
      `;

      const result = await this.pool.query(query, [
        oneHourFromNow.toTimeString().slice(0, 5),
        twoHoursFromNow.toTimeString().slice(0, 5)
      ]);

      // Send reminders to all participants
      for (const row of result.rows) {
        const tripData = {
          originCity: row.origin_city,
          destinationCity: row.destination_city,
          departureDate: row.departure_date,
          departureTime: row.departure_time
        };

        // Send to driver
        await this.notificationService.sendTripReminder(row.driver_id, tripData);

        // Send to passenger
        await this.notificationService.sendTripReminder(row.passenger_id, tripData);
      }

      console.log(`Sent ${result.rows.length} trip reminders`);

    } catch (error) {
      console.error('Error sending trip reminders:', error);
    }
  }

  /**
   * Start the scheduler (run every 30 minutes)
   */
  startScheduler(): void {
    // Run immediately
    this.sendTripReminders();

    // Then run every 30 minutes
    setInterval(() => {
      this.sendTripReminders();
    }, 30 * 60 * 1000); // 30 minutes

    console.log('Trip reminder scheduler started');
  }
}