import { Pool } from 'pg';
import { TripSearchFilters, TripWithDriver, ECUADOR_CITIES } from '../models/Trip';
import { CacheService } from './CacheService';

export class TripSearchService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Advanced trip search with intelligent filtering and optimization
   */
  async searchTripsAdvanced(
    filters: TripSearchFilters, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{
    trips: TripWithDriver[];
    total: number;
    totalPages: number;
    searchMetadata: {
      appliedFilters: string[];
      searchTime: number;
      cached: boolean;
      suggestions?: any;
    };
  }> {
    const startTime = Date.now();
    const appliedFilters: string[] = [];

    // Check cache first
    const cachedResult = await CacheService.getCachedSearchResults(filters, page, limit);
    if (cachedResult) {
      return {
        ...cachedResult,
        searchMetadata: {
          appliedFilters: this.getAppliedFilters(filters),
          searchTime: Date.now() - startTime,
          cached: true
        }
      };
    }

    // Build optimized query
    const queryBuilder = this.buildOptimizedQuery(filters, page, limit);
    appliedFilters.push(...queryBuilder.appliedFilters);

    // Execute search
    const [countResult, tripsResult] = await Promise.all([
      this.pool.query(queryBuilder.countQuery, queryBuilder.countValues),
      this.pool.query(queryBuilder.searchQuery, queryBuilder.searchValues)
    ]);

    const total = parseInt(countResult.rows[0].total);
    const trips = tripsResult.rows.map(row => this.mapRowToTripWithDriver(row));

    const result = {
      trips,
      total,
      totalPages: Math.ceil(total / limit)
    };

    // Cache the results
    await CacheService.cacheSearchResults(filters, page, limit, result);

    // Get suggestions if no results
    let suggestions = null;
    if (total === 0) {
      suggestions = await this.getIntelligentSuggestions(filters);
    }

    return {
      ...result,
      searchMetadata: {
        appliedFilters,
        searchTime: Date.now() - startTime,
        cached: false,
        suggestions
      }
    };
  }

  /**
   * Build optimized query based on filters
   */
  private buildOptimizedQuery(filters: TripSearchFilters, page: number, limit: number) {
    const offset = (page - 1) * limit;
    const whereConditions: string[] = ['t.status = $1'];
    const values: any[] = ['active'];
    const appliedFilters: string[] = ['status:active'];
    let paramCount = 2;

    // Core location filters (most selective)
    if (filters.originCity) {
      whereConditions.push(`t.origin_city = $${paramCount}`);
      values.push(filters.originCity);
      appliedFilters.push(`origin:${filters.originCity}`);
      paramCount++;
    }

    if (filters.destinationCity) {
      whereConditions.push(`t.destination_city = $${paramCount}`);
      values.push(filters.destinationCity);
      appliedFilters.push(`destination:${filters.destinationCity}`);
      paramCount++;
    }

    // Date filters (highly selective)
    if (filters.departureDate) {
      whereConditions.push(`t.departure_date = $${paramCount}`);
      values.push(filters.departureDate);
      appliedFilters.push(`date:${filters.departureDate}`);
      paramCount++;
    }

    // Time range filters
    if (filters.departureTimeFrom) {
      whereConditions.push(`t.departure_time >= $${paramCount}`);
      values.push(filters.departureTimeFrom);
      appliedFilters.push(`timeFrom:${filters.departureTimeFrom}`);
      paramCount++;
    }

    if (filters.departureTimeTo) {
      whereConditions.push(`t.departure_time <= $${paramCount}`);
      values.push(filters.departureTimeTo);
      appliedFilters.push(`timeTo:${filters.departureTimeTo}`);
      paramCount++;
    }

    // Price range filters
    if (filters.minPrice) {
      whereConditions.push(`t.price_per_seat >= $${paramCount}`);
      values.push(filters.minPrice);
      appliedFilters.push(`minPrice:${filters.minPrice}`);
      paramCount++;
    }

    if (filters.maxPrice) {
      whereConditions.push(`t.price_per_seat <= $${paramCount}`);
      values.push(filters.maxPrice);
      appliedFilters.push(`maxPrice:${filters.maxPrice}`);
      paramCount++;
    }

    // Seat availability filter
    if (filters.minSeats) {
      whereConditions.push(`t.available_seats >= $${paramCount}`);
      values.push(filters.minSeats);
      appliedFilters.push(`minSeats:${filters.minSeats}`);
      paramCount++;
    }

    // Driver quality filters
    if (filters.minDriverRating) {
      whereConditions.push(`u.rating >= $${paramCount}`);
      values.push(filters.minDriverRating);
      appliedFilters.push(`minRating:${filters.minDriverRating}`);
      paramCount++;
    }

    // Verification filter (complex but important for safety)
    if (filters.verifiedDriversOnly) {
      whereConditions.push(`
        (u.verification_status->>'phoneVerified')::boolean = true AND
        (u.verification_status->>'identityVerified')::boolean = true AND
        (u.verification_status->>'backgroundCheckPassed')::boolean = true AND
        (u.verification_status->>'driverLicenseVerified')::boolean = true
      `);
      appliedFilters.push('verifiedOnly:true');
    }

    // Build optimized ORDER BY clause
    const orderByClause = this.buildOrderByClause(filters);

    // Base query with optimized joins
    const baseQuery = `
      FROM trips t
      INNER JOIN users u ON t.driver_id = u.id
      LEFT JOIN (
        SELECT trip_id, COUNT(*)::int as booked_seats
        FROM bookings 
        WHERE status IN ('confirmed', 'completed')
        GROUP BY trip_id
      ) b ON t.id = b.trip_id
      WHERE ${whereConditions.join(' AND ')}
    `;

    // Count query (optimized for counting)
    const countQuery = `
      SELECT COUNT(*) as total
      ${baseQuery}
    `;

    // Search query with all data
    const searchQuery = `
      SELECT 
        t.id, t.driver_id, t.origin_city, t.destination_city, t.departure_date,
        t.departure_time, t.estimated_arrival_time, t.available_seats, t.total_seats,
        t.price_per_seat, t.vehicle_info, t.description, t.status, t.created_at, t.updated_at,
        u.first_name, u.last_name, u.profile_photo, u.rating, u.total_trips,
        u.verification_status,
        COALESCE(b.booked_seats, 0) as booked_seats
      ${baseQuery}
      ${orderByClause}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const searchValues = [...values, limit, offset];
    const countValues = [...values];

    return {
      countQuery,
      searchQuery,
      countValues,
      searchValues,
      appliedFilters
    };
  }

  /**
   * Build optimized ORDER BY clause
   */
  private buildOrderByClause(filters: TripSearchFilters): string {
    const sortBy = filters.sortBy || 'departure_time';
    const sortOrder = filters.sortOrder || 'asc';
    
    switch (sortBy) {
      case 'price':
        return `ORDER BY t.price_per_seat ${sortOrder.toUpperCase()}, t.departure_time ASC`;
      case 'departure_time':
        return `ORDER BY t.departure_date ${sortOrder.toUpperCase()}, t.departure_time ${sortOrder.toUpperCase()}`;
      case 'driver_rating':
        return `ORDER BY u.rating ${sortOrder.toUpperCase()}, t.departure_time ASC`;
      case 'available_seats':
        return `ORDER BY t.available_seats ${sortOrder.toUpperCase()}, t.departure_time ASC`;
      case 'created_at':
        return `ORDER BY t.created_at ${sortOrder.toUpperCase()}`;
      default:
        return `ORDER BY t.departure_date ASC, t.departure_time ASC`;
    }
  }

  /**
   * Get intelligent suggestions when no results found
   */
  private async getIntelligentSuggestions(filters: TripSearchFilters) {
    const suggestions = {
      relaxedFilters: [] as any[],
      alternativeDates: [] as any[],
      nearbyRoutes: [] as any[],
      popularRoutes: [] as any[]
    };

    // Suggest relaxing price filters if they exist
    if (filters.minPrice || filters.maxPrice) {
      const relaxedPriceFilters = { ...filters };
      delete relaxedPriceFilters.minPrice;
      delete relaxedPriceFilters.maxPrice;
      
      const relaxedResults = await this.searchWithRelaxedFilters(relaxedPriceFilters, 3);
      if (relaxedResults.length > 0) {
        suggestions.relaxedFilters.push({
          type: 'price_range',
          message: 'Prueba expandir tu rango de precios',
          results: relaxedResults
        });
      }
    }

    // Suggest alternative dates
    if (filters.departureDate && filters.originCity && filters.destinationCity) {
      const alternativeDates = await this.getAlternativeDates(
        filters.originCity,
        filters.destinationCity,
        filters.departureDate,
        5
      );
      suggestions.alternativeDates = alternativeDates;
    }

    // Get popular routes as fallback
    const popularRoutes = await this.getPopularRoutes(5);
    suggestions.popularRoutes = popularRoutes;

    return suggestions;
  }

  /**
   * Search with relaxed filters
   */
  private async searchWithRelaxedFilters(filters: TripSearchFilters, limit: number): Promise<TripWithDriver[]> {
    const queryBuilder = this.buildOptimizedQuery(filters, 1, limit);
    const result = await this.pool.query(queryBuilder.searchQuery, queryBuilder.searchValues);
    return result.rows.map(row => this.mapRowToTripWithDriver(row));
  }

  /**
   * Get alternative dates for the same route
   */
  private async getAlternativeDates(
    originCity: string,
    destinationCity: string,
    originalDate: string,
    limit: number
  ): Promise<TripWithDriver[]> {
    const searchDate = new Date(originalDate);
    const threeDaysBefore = new Date(searchDate);
    threeDaysBefore.setDate(searchDate.getDate() - 3);
    const threeDaysAfter = new Date(searchDate);
    threeDaysAfter.setDate(searchDate.getDate() + 3);

    const query = `
      SELECT 
        t.id, t.driver_id, t.origin_city, t.destination_city, t.departure_date,
        t.departure_time, t.estimated_arrival_time, t.available_seats, t.total_seats,
        t.price_per_seat, t.vehicle_info, t.description, t.status, t.created_at, t.updated_at,
        u.first_name, u.last_name, u.profile_photo, u.rating, u.total_trips,
        u.verification_status,
        COALESCE(b.booked_seats, 0) as booked_seats,
        ABS(EXTRACT(DAY FROM t.departure_date - $5::date)) as date_diff
      FROM trips t
      INNER JOIN users u ON t.driver_id = u.id
      LEFT JOIN (
        SELECT trip_id, COUNT(*)::int as booked_seats
        FROM bookings 
        WHERE status IN ('confirmed', 'completed')
        GROUP BY trip_id
      ) b ON t.id = b.trip_id
      WHERE t.status = 'active'
        AND t.origin_city = $1
        AND t.destination_city = $2
        AND t.departure_date BETWEEN $3 AND $4
        AND t.departure_date != $5
      ORDER BY date_diff ASC, t.departure_time ASC
      LIMIT $6
    `;

    const result = await this.pool.query(query, [
      originCity,
      destinationCity,
      threeDaysBefore.toISOString().split('T')[0],
      threeDaysAfter.toISOString().split('T')[0],
      originalDate,
      limit
    ]);

    return result.rows.map(row => this.mapRowToTripWithDriver(row));
  }

  /**
   * Get popular routes
   */
  private async getPopularRoutes(limit: number): Promise<Array<{
    originCity: string;
    destinationCity: string;
    tripCount: number;
  }>> {
    const query = `
      SELECT 
        origin_city, destination_city, COUNT(*) as trip_count
      FROM trips 
      WHERE created_at >= NOW() - INTERVAL '30 days'
        AND status = 'active'
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
   * Get applied filters for metadata
   */
  private getAppliedFilters(filters: TripSearchFilters): string[] {
    const applied: string[] = [];
    
    if (filters.originCity) applied.push(`origin:${filters.originCity}`);
    if (filters.destinationCity) applied.push(`destination:${filters.destinationCity}`);
    if (filters.departureDate) applied.push(`date:${filters.departureDate}`);
    if (filters.minPrice) applied.push(`minPrice:${filters.minPrice}`);
    if (filters.maxPrice) applied.push(`maxPrice:${filters.maxPrice}`);
    if (filters.minSeats) applied.push(`minSeats:${filters.minSeats}`);
    if (filters.minDriverRating) applied.push(`minRating:${filters.minDriverRating}`);
    if (filters.verifiedDriversOnly) applied.push('verifiedOnly:true');
    if (filters.departureTimeFrom) applied.push(`timeFrom:${filters.departureTimeFrom}`);
    if (filters.departureTimeTo) applied.push(`timeTo:${filters.departureTimeTo}`);
    if (filters.sortBy) applied.push(`sortBy:${filters.sortBy}`);
    if (filters.sortOrder) applied.push(`sortOrder:${filters.sortOrder}`);
    
    return applied;
  }

  /**
   * Map database row to TripWithDriver object
   */
  private mapRowToTripWithDriver(row: any): TripWithDriver {
    return {
      trip: {
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
        vehicleInfo: row.vehicle_info,
        description: row.description,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      },
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
}