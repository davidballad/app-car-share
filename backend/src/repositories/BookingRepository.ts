import { Pool } from 'pg';
import { Booking, CreateBookingRequest, UpdateBookingRequest, BookingWithDetails, PaymentMethod, BookingStatus } from '../models/Booking';

export class BookingRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Create a new booking with seat availability validation
   */
  async createBooking(passengerId: string, bookingData: CreateBookingRequest): Promise<Booking> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check trip availability and get current available seats
      const tripQuery = `
        SELECT available_seats, price_per_seat, status, departure_date
        FROM trips 
        WHERE id = $1 AND status = 'active'
        FOR UPDATE
      `;
      const tripResult = await client.query(tripQuery, [bookingData.tripId]);
      
      if (tripResult.rows.length === 0) {
        throw new Error('Trip not found or not available for booking');
      }

      const trip = tripResult.rows[0];
      
      // Check if trip is in the future
      const now = new Date();
      const departureDate = new Date(trip.departure_date);
      if (departureDate <= now) {
        throw new Error('Cannot book trips that have already departed');
      }

      // Check seat availability
      if (trip.available_seats < bookingData.seatsBooked) {
        throw new Error(`Only ${trip.available_seats} seats available`);
      }

      // Calculate total amount
      const totalAmount = trip.price_per_seat * bookingData.seatsBooked;

      // Create booking
      const bookingQuery = `
        INSERT INTO bookings (trip_id, passenger_id, seats_booked, total_amount, payment_method, status)
        VALUES ($1, $2, $3, $4, $5, 'confirmed')
        RETURNING *
      `;
      const bookingValues = [
        bookingData.tripId,
        passengerId,
        bookingData.seatsBooked,
        totalAmount,
        bookingData.paymentMethod
      ];

      const bookingResult = await client.query(bookingQuery, bookingValues);

      // Update trip available seats
      const updateTripQuery = `
        UPDATE trips 
        SET available_seats = available_seats - $1, updated_at = NOW()
        WHERE id = $2
      `;
      await client.query(updateTripQuery, [bookingData.seatsBooked, bookingData.tripId]);

      await client.query('COMMIT');
      return this.mapRowToBooking(bookingResult.rows[0]);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: string): Promise<Booking | null> {
    const query = `SELECT * FROM bookings WHERE id = $1`;
    const result = await this.pool.query(query, [bookingId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToBooking(result.rows[0]);
  }

  /**
   * Get booking with full details (trip, passenger, driver info)
   */
  async getBookingWithDetails(bookingId: string): Promise<BookingWithDetails | null> {
    const query = `
      SELECT 
        b.*,
        t.id as trip_id, t.origin_city, t.destination_city, t.departure_date, 
        t.departure_time, t.price_per_seat, t.driver_id,
        p.first_name as passenger_first_name, p.last_name as passenger_last_name,
        p.profile_photo as passenger_photo, p.rating as passenger_rating,
        d.first_name as driver_first_name, d.last_name as driver_last_name,
        d.profile_photo as driver_photo, d.rating as driver_rating
      FROM bookings b
      JOIN trips t ON b.trip_id = t.id
      JOIN users p ON b.passenger_id = p.id
      JOIN users d ON t.driver_id = d.id
      WHERE b.id = $1
    `;

    const result = await this.pool.query(query, [bookingId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      booking: this.mapRowToBooking(row),
      trip: {
        id: row.trip_id,
        originCity: row.origin_city,
        destinationCity: row.destination_city,
        departureDate: row.departure_date,
        departureTime: row.departure_time,
        pricePerSeat: parseFloat(row.price_per_seat),
        driverId: row.driver_id
      },
      passenger: {
        id: row.passenger_id,
        firstName: row.passenger_first_name,
        lastName: row.passenger_last_name,
        profilePhoto: row.passenger_photo,
        rating: parseFloat(row.passenger_rating) || 0
      },
      driver: {
        id: row.driver_id,
        firstName: row.driver_first_name,
        lastName: row.driver_last_name,
        profilePhoto: row.driver_photo,
        rating: parseFloat(row.driver_rating) || 0
      }
    };
  }

  /**
   * Update booking status
   */
  async updateBooking(bookingId: string, updateData: UpdateBookingRequest): Promise<Booking | null> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbField = this.camelToSnakeCase(key);
        updateFields.push(`${dbField} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return this.getBookingById(bookingId);
    }

    values.push(bookingId);

    const query = `
      UPDATE bookings 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToBooking(result.rows[0]);
  }

  /**
   * Cancel booking and restore seats
   */
  async cancelBooking(bookingId: string, cancellationReason: string): Promise<boolean> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get booking details
      const bookingQuery = `
        SELECT trip_id, seats_booked, status 
        FROM bookings 
        WHERE id = $1
        FOR UPDATE
      `;
      const bookingResult = await client.query(bookingQuery, [bookingId]);
      
      if (bookingResult.rows.length === 0) {
        throw new Error('Booking not found');
      }

      const booking = bookingResult.rows[0];
      
      if (booking.status === 'cancelled') {
        throw new Error('Booking is already cancelled');
      }

      if (booking.status === 'completed') {
        throw new Error('Cannot cancel completed booking');
      }

      // Update booking status
      const updateBookingQuery = `
        UPDATE bookings 
        SET status = 'cancelled', cancellation_reason = $1, updated_at = NOW()
        WHERE id = $2
      `;
      await client.query(updateBookingQuery, [cancellationReason, bookingId]);

      // Restore seats to trip
      const updateTripQuery = `
        UPDATE trips 
        SET available_seats = available_seats + $1, updated_at = NOW()
        WHERE id = $2
      `;
      await client.query(updateTripQuery, [booking.seats_booked, booking.trip_id]);

      await client.query('COMMIT');
      return true;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get bookings by passenger
   */
  async getBookingsByPassenger(passengerId: string, status?: BookingStatus): Promise<BookingWithDetails[]> {
    let query = `
      SELECT 
        b.*,
        t.id as trip_id, t.origin_city, t.destination_city, t.departure_date, 
        t.departure_time, t.price_per_seat, t.driver_id,
        p.first_name as passenger_first_name, p.last_name as passenger_last_name,
        p.profile_photo as passenger_photo, p.rating as passenger_rating,
        d.first_name as driver_first_name, d.last_name as driver_last_name,
        d.profile_photo as driver_photo, d.rating as driver_rating
      FROM bookings b
      JOIN trips t ON b.trip_id = t.id
      JOIN users p ON b.passenger_id = p.id
      JOIN users d ON t.driver_id = d.id
      WHERE b.passenger_id = $1
    `;
    
    const values: any[] = [passengerId];

    if (status) {
      query += ` AND b.status = $2`;
      values.push(status);
    }

    query += ` ORDER BY b.booking_date DESC`;

    const result = await this.pool.query(query, values);
    
    return result.rows.map(row => ({
      booking: this.mapRowToBooking(row),
      trip: {
        id: row.trip_id,
        originCity: row.origin_city,
        destinationCity: row.destination_city,
        departureDate: row.departure_date,
        departureTime: row.departure_time,
        pricePerSeat: parseFloat(row.price_per_seat),
        driverId: row.driver_id
      },
      passenger: {
        id: row.passenger_id,
        firstName: row.passenger_first_name,
        lastName: row.passenger_last_name,
        profilePhoto: row.passenger_photo,
        rating: parseFloat(row.passenger_rating) || 0
      },
      driver: {
        id: row.driver_id,
        firstName: row.driver_first_name,
        lastName: row.driver_last_name,
        profilePhoto: row.driver_photo,
        rating: parseFloat(row.driver_rating) || 0
      }
    }));
  }

  /**
   * Get bookings for a trip (for drivers)
   */
  async getBookingsForTrip(tripId: string): Promise<BookingWithDetails[]> {
    const query = `
      SELECT 
        b.*,
        t.id as trip_id, t.origin_city, t.destination_city, t.departure_date, 
        t.departure_time, t.price_per_seat, t.driver_id,
        p.first_name as passenger_first_name, p.last_name as passenger_last_name,
        p.profile_photo as passenger_photo, p.rating as passenger_rating,
        d.first_name as driver_first_name, d.last_name as driver_last_name,
        d.profile_photo as driver_photo, d.rating as driver_rating
      FROM bookings b
      JOIN trips t ON b.trip_id = t.id
      JOIN users p ON b.passenger_id = p.id
      JOIN users d ON t.driver_id = d.id
      WHERE b.trip_id = $1 AND b.status IN ('confirmed', 'completed')
      ORDER BY b.booking_date ASC
    `;

    const result = await this.pool.query(query, [tripId]);
    
    return result.rows.map(row => ({
      booking: this.mapRowToBooking(row),
      trip: {
        id: row.trip_id,
        originCity: row.origin_city,
        destinationCity: row.destination_city,
        departureDate: row.departure_date,
        departureTime: row.departure_time,
        pricePerSeat: parseFloat(row.price_per_seat),
        driverId: row.driver_id
      },
      passenger: {
        id: row.passenger_id,
        firstName: row.passenger_first_name,
        lastName: row.passenger_last_name,
        profilePhoto: row.passenger_photo,
        rating: parseFloat(row.passenger_rating) || 0
      },
      driver: {
        id: row.driver_id,
        firstName: row.driver_first_name,
        lastName: row.driver_last_name,
        profilePhoto: row.driver_photo,
        rating: parseFloat(row.driver_rating) || 0
      }
    }));
  }

  /**
   * Map database row to Booking object
   */
  private mapRowToBooking(row: any): Booking {
    return {
      id: row.id,
      tripId: row.trip_id,
      passengerId: row.passenger_id,
      seatsBooked: parseInt(row.seats_booked),
      totalAmount: parseFloat(row.total_amount),
      paymentMethod: row.payment_method as PaymentMethod,
      status: row.status as BookingStatus,
      bookingDate: row.booking_date,
      cancellationReason: row.cancellation_reason,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * Convert camelCase to snake_case
   */
  private camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}