import { Pool } from 'pg';
import { Trip, CreateTripRequest, UpdateTripRequest, TripSearchFilters, TripWithDriver, VehicleInfo } from '../models/Trip';

export class TripRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Create a new trip
   */
  async createTrip(driverId: string, tripData: CreateTripRequest): Promise<Trip> {
    const query = `
      INSERT INTO trips (
        driver_id, origin_city, destination_city, departure_date, departure_time,
        estimated_arrival_time, available_seats, total_seats, price_per_seat,
        vehicle_info, description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      driverId,
      tripData.originCity,
      tripData.destinationCity,
      tripData.departureDate,
      tripData.departureTime,
      tripData.estimatedArrivalTime,
      tripData.availableSeats,
      tripData.pricePerSeat,
      JSON.stringify(tripData.vehicleInfo),
      tripData.description
    ];

    const result = await this.pool.query(query, values);
    return this.mapRowToTrip(result.rows[0]);
  }

  /**
   * Get trip by ID
   */
  async getTripById(tripId: string): Promise<Trip | null> {
    const query = `
      SELECT * FROM trips WHERE id = $1
    `;

    const result = await this.pool.query(query, [tripId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToTrip(result.rows[0]);
  }

  /**
   * Get trip with driver information
   */
  async getTripWithDriver(tripId: string): Promise<TripWithDriver | null> {
    const query = `
      SELECT 
        t.*,
        u.first_name, u.last_name, u.profile_photo, u.rating, u.total_trips,
        u.verification_status,
        COALESCE(b.booked_seats, 0) as booked_seats
      FROM trips t
      JOIN users u ON t.driver_id = u.id
      LEFT JOIN (
        SELECT trip_id, COUNT(*) as booked_seats
        FROM bookings 
        WHERE status IN ('confirmed', 'completed')
        GROUP BY trip_id
      ) b ON t.id = b.trip_id
      WHERE t.id = $1
    `;

    const result = await this.pool.query(query, [tripId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      trip: this.mapRowToTrip(row),
      driver: {
        id: row.driver_id,
        firstName: row.first_name,
        lastName: row.last_name,
        profilePhoto: row.profile_photo,
        rating: parseFloat(row.rating) || 0,
        totalTrips: parseInt(row.total_trips) || 0,
        verificationStatus: row.verification_status || {
          phoneVerified: false,
          identityVerified: false,
          backgroundCheckPassed: false,
          driverLicenseVerified: false,
          vehicleRegistrationVerified: false
        }
      },
      bookedSeats: parseInt(row.booked_seats) || 0
    };
  }

  /**
   * Update trip
   */
  async updateTrip(tripId: string, driverId: string, updateData: UpdateTripRequest): Promise<Trip | null> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Build dynamic update query
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbField = this.camelToSnakeCase(key);
        updateFields.push(`${dbField} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return this.getTripById(tripId);
    }

    values.push(tripId, driverId);

    const query = `
      UPDATE trips 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount} AND driver_id = $${paramCount + 1}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToTrip(result.rows[0]);
  }

  /**
   * Delete trip (only if no bookings)
   */
  async deleteTrip(tripId: string, driverId: string): Promise<boolean> {
    // Check if trip has any confirmed bookings
    const bookingCheck = await this.pool.query(`
      SELECT COUNT(*) as booking_count
      FROM bookings 
      WHERE trip_id = $1 AND status IN ('confirmed', 'completed')
    `, [tripId]);

    const bookingCount = parseInt(bookingCheck.rows[0].booking_count);
    
    if (bookingCount > 0) {
      throw new Error('Cannot delete trip with existing bookings');
    }

    const query = `
      DELETE FROM trips 
      WHERE id = $1 AND driver_id = $2
      RETURNING id
    `;

    const result = await this.pool.query(query, [tripId, driverId]);
    return result.rows.length > 0;
  }

  /**
   * Search trips with filters
   */
  async searchTrips(filters: TripSearchFilters, page: number = 1, limit: number = 20): Promise<{
    trips: TripWithDriver[];
    total: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    const whereConditions: string[] = ['t.status = $1'];
    const values: any[] = ['active'];
    let paramCount = 2;

    // Build where conditions
    if (filters.originCity) {
      whereConditions.push(`t.origin_city = $${paramCount}`);
      values.push(filters.originCity);
      paramCount++;
    }

    if (filters.destinationCity) {
      whereConditions.push(`t.destination_city = $${paramCount}`);
      values.push(filters.destinationCity);
      paramCount++;
    }

    if (filters.departureDate) {
      whereConditions.push(`t.departure_date = $${paramCount}`);
      values.push(filters.departureDate);
      paramCount++;
    }

    if (filters.minPrice) {
      whereConditions.push(`t.price_per_seat >= $${paramCount}`);
      values.push(filters.minPrice);
      paramCount++;
    }

    if (filters.maxPrice) {
      whereConditions.push(`t.price_per_seat <= $${paramCount}`);
      values.push(filters.maxPrice);
      paramCount++;
    }

    if (filters.minSeats) {
      whereConditions.push(`t.available_seats >= $${paramCount}`);
      values.push(filters.minSeats);
      paramCount++;
    }

    // Enhanced filters for driver rating
    if (filters.minDriverRating) {
      whereConditions.push(`u.rating >= $${paramCount}`);
      values.push(filters.minDriverRating);
      paramCount++;
    }

    // Filter for verified drivers only
    if (filters.verifiedDriversOnly) {
      whereConditions.push(`
        (u.verification_status->>'phoneVerified')::boolean = true AND
        (u.verification_status->>'identityVerified')::boolean = true AND
        (u.verification_status->>'backgroundCheckPassed')::boolean = true AND
        (u.verification_status->>'driverLicenseVerified')::boolean = true
      `);
    }

    // Time range filters
    if (filters.departureTimeFrom) {
      whereConditions.push(`t.departure_time >= $${paramCount}`);
      values.push(filters.departureTimeFrom);
      paramCount++;
    }

    if (filters.departureTimeTo) {
      whereConditions.push(`t.departure_time <= $${paramCount}`);
      values.push(filters.departureTimeTo);
      paramCount++;
    }

    // Build order by clause with enhanced sorting options
    const sortBy = filters.sortBy || 'departure_time';
    const sortOrder = filters.sortOrder || 'asc';
    
    let orderByClause: string;
    switch (sortBy) {
      case 'price':
        orderByClause = `ORDER BY t.price_per_seat ${sortOrder.toUpperCase()}`;
        break;
      case 'departure_time':
        orderByClause = `ORDER BY t.departure_date ${sortOrder.toUpperCase()}, t.departure_time ${sortOrder.toUpperCase()}`;
        break;
      case 'driver_rating':
        orderByClause = `ORDER BY u.rating ${sortOrder.toUpperCase()}, t.departure_time ASC`;
        break;
      case 'available_seats':
        orderByClause = `ORDER BY t.available_seats ${sortOrder.toUpperCase()}, t.departure_time ASC`;
        break;
      case 'created_at':
        orderByClause = `ORDER BY t.created_at ${sortOrder.toUpperCase()}`;
        break;
      default:
        orderByClause = `ORDER BY t.departure_date ASC, t.departure_time ASC`;
    }

    const baseQuery = `
      FROM trips t
      JOIN users u ON t.driver_id = u.id
      LEFT JOIN (
        SELECT trip_id, COUNT(*) as booked_seats
        FROM bookings 
        WHERE status IN ('confirmed', 'completed')
        GROUP BY trip_id
      ) b ON t.id = b.trip_id
      WHERE ${whereConditions.join(' AND ')}
    `;

    // Get total count
    const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
    const countResult = await this.pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Get trips
    const tripsQuery = `
      SELECT 
        t.*,
        u.first_name, u.last_name, u.profile_photo, u.rating, u.total_trips,
        u.verification_status,
        COALESCE(b.booked_seats, 0) as booked_seats
      ${baseQuery}
      ${orderByClause}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    values.push(limit, offset);
    const tripsResult = await this.pool.query(tripsQuery, values);

    const trips = tripsResult.rows.map(row => ({
      trip: this.mapRowToTrip(row),
      driver: {
        id: row.driver_id,
        firstName: row.first_name,
        lastName: row.last_name,
        profilePhoto: row.profile_photo,
        rating: parseFloat(row.rating) || 0,
        totalTrips: parseInt(row.total_trips) || 0,
        verificationStatus: row.verification_status || {
          phoneVerified: false,
          identityVerified: false,
          backgroundCheckPassed: false,
          driverLicenseVerified: false,
          vehicleRegistrationVerified: false
        }
      },
      bookedSeats: parseInt(row.booked_seats) || 0
    }));

    return {
      trips,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get alternative trip suggestions when no results found
   */
  async getAlternativeTripSuggestions(filters: TripSearchFilters): Promise<{
    alternativeDates: TripWithDriver[];
    nearbyRoutes: TripWithDriver[];
    popularRoutes: Array<{ originCity: string; destinationCity: string; tripCount: number }>;
  }> {
    const suggestions = {
      alternativeDates: [] as TripWithDriver[],
      nearbyRoutes: [] as TripWithDriver[],
      popularRoutes: [] as Array<{ originCity: string; destinationCity: string; tripCount: number }>
    };

    // Get alternative dates (±3 days) if specific date was searched
    if (filters.originCity && filters.destinationCity && filters.departureDate) {
      const searchDate = new Date(filters.departureDate);
      const threeDaysBefore = new Date(searchDate);
      threeDaysBefore.setDate(searchDate.getDate() - 3);
      const threeDaysAfter = new Date(searchDate);
      threeDaysAfter.setDate(searchDate.getDate() + 3);

      const alternativeDateQuery = `
        SELECT 
          t.*,
          u.first_name, u.last_name, u.profile_photo, u.rating, u.total_trips,
          u.verification_status,
          COALESCE(b.booked_seats, 0) as booked_seats
        FROM trips t
        JOIN users u ON t.driver_id = u.id
        LEFT JOIN (
          SELECT trip_id, COUNT(*) as booked_seats
          FROM bookings 
          WHERE status IN ('confirmed', 'completed')
          GROUP BY trip_id
        ) b ON t.id = b.trip_id
        WHERE t.status = 'active'
          AND t.origin_city = $1
          AND t.destination_city = $2
          AND t.departure_date BETWEEN $3 AND $4
          AND t.departure_date != $5
        ORDER BY ABS(EXTRACT(DAY FROM t.departure_date - $5::date)), t.departure_time
        LIMIT 5
      `;

      const altDateResult = await this.pool.query(alternativeDateQuery, [
        filters.originCity,
        filters.destinationCity,
        threeDaysBefore.toISOString().split('T')[0],
        threeDaysAfter.toISOString().split('T')[0],
        filters.departureDate
      ]);

      suggestions.alternativeDates = altDateResult.rows.map(row => ({
        trip: this.mapRowToTrip(row),
        driver: {
          id: row.driver_id,
          firstName: row.first_name,
          lastName: row.last_name,
          profilePhoto: row.profile_photo,
          rating: parseFloat(row.rating) || 0,
          totalTrips: parseInt(row.total_trips) || 0,
          verificationStatus: row.verification_status || {}
        },
        bookedSeats: parseInt(row.booked_seats) || 0
      }));
    }

    // Get popular routes for general suggestions
    suggestions.popularRoutes = await this.getPopularRoutes(5);

    return suggestions;
  }

  /**
   * Get trips by driver
   */
  async getTripsByDriver(driverId: string, status?: string): Promise<Trip[]> {
    let query = `
      SELECT * FROM trips 
      WHERE driver_id = $1
    `;
    const values: any[] = [driverId];

    if (status) {
      query += ` AND status = $2`;
      values.push(status);
    }

    query += ` ORDER BY departure_date DESC, departure_time DESC`;

    const result = await this.pool.query(query, values);
    return result.rows.map(row => this.mapRowToTrip(row));
  }

  /**
   * Update available seats (used when booking/cancelling)
   */
  async updateAvailableSeats(tripId: string, seatChange: number): Promise<boolean> {
    const query = `
      UPDATE trips 
      SET available_seats = available_seats + $1, updated_at = NOW()
      WHERE id = $2 AND available_seats + $1 >= 0
      RETURNING id
    `;

    const result = await this.pool.query(query, [seatChange, tripId]);
    return result.rows.length > 0;
  }

  /**
   * Get popular routes
   */
  async getPopularRoutes(limit: number = 10): Promise<Array<{
    originCity: string;
    destinationCity: string;
    tripCount: number;
  }>> {
    const query = `
      SELECT 
        origin_city, destination_city, COUNT(*) as trip_count
      FROM trips 
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY origin_city, destination_city
      ORDER BY trip_count DESC
      LIMIT $1
    `;

    const result = await this.pool.query(query, [limit]);
    return result.rows.map(row => ({
      originCity: row.origin_city,
      destinationCity: row.destination_city,
      tripCount: parseInt(row.trip_count)
    }));
  }

  /**
   * Map database row to Trip object
   */
  private mapRowToTrip(row: any): Trip {
    return {
      id: row.id,
      driverId: row.driver_id,
      originCity: row.origin_city,
      destinationCity: row.destination_city,
      departureDate: row.departure_date,
      departureTime: row.departure_time,
      estimatedArrivalTime: row.estimated_arrival_time,
      availableSeats: parseInt(row.available_seats),
      totalSeats: parseInt(row.total_seats),
      pricePerSeat: parseFloat(row.price_per_seat),
      vehicleInfo: row.vehicle_info as VehicleInfo,
      description: row.description,
      status: row.status,
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