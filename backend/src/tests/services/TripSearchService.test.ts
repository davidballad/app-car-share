import { TripSearchService } from '../../services/TripSearchService';
import { TripSearchFilters } from '../../models/Trip';

// Mock CacheService
jest.mock('../../services/CacheService', () => ({
  CacheService: {
    getCachedSearchResults: jest.fn().mockResolvedValue(null),
    cacheSearchResults: jest.fn().mockResolvedValue(undefined)
  }
}));

// Mock pool for testing
const mockPool = {
  query: jest.fn()
} as any;

describe('TripSearchService', () => {
  let tripSearchService: TripSearchService;

  beforeEach(() => {
    tripSearchService = new TripSearchService(mockPool);
    jest.clearAllMocks();
  });

  describe('searchTripsAdvanced', () => {
    it('should build correct query for basic search', async () => {
      const filters: TripSearchFilters = {
        originCity: 'Quito',
        destinationCity: 'Guayaquil',
        departureDate: '2024-12-01'
      };

      // Mock database responses
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ total: '0' }] }) // count query
        .mockResolvedValueOnce({ rows: [] }); // search query

      const result = await tripSearchService.searchTripsAdvanced(filters, 1, 20);

      expect(result.total).toBe(0);
      expect(result.trips).toEqual([]);
      expect(result.searchMetadata.appliedFilters).toContain('origin:Quito');
      expect(result.searchMetadata.appliedFilters).toContain('destination:Guayaquil');
      expect(result.searchMetadata.appliedFilters).toContain('date:2024-12-01');
    });

    it('should handle price range filters correctly', async () => {
      const filters: TripSearchFilters = {
        minPrice: 10,
        maxPrice: 50
      };

      mockPool.query
        .mockResolvedValueOnce({ rows: [{ total: '0' }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await tripSearchService.searchTripsAdvanced(filters, 1, 20);

      expect(result.searchMetadata.appliedFilters).toContain('minPrice:10');
      expect(result.searchMetadata.appliedFilters).toContain('maxPrice:50');
    });

    it('should handle driver rating filter correctly', async () => {
      const filters: TripSearchFilters = {
        minDriverRating: 4.5,
        verifiedDriversOnly: true
      };

      mockPool.query
        .mockResolvedValueOnce({ rows: [{ total: '0' }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await tripSearchService.searchTripsAdvanced(filters, 1, 20);

      expect(result.searchMetadata.appliedFilters).toContain('minRating:4.5');
      expect(result.searchMetadata.appliedFilters).toContain('verifiedOnly:true');
    });

    it('should handle time range filters correctly', async () => {
      const filters: TripSearchFilters = {
        departureTimeFrom: '08:00',
        departureTimeTo: '18:00'
      };

      mockPool.query
        .mockResolvedValueOnce({ rows: [{ total: '0' }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await tripSearchService.searchTripsAdvanced(filters, 1, 20);

      expect(result.searchMetadata.appliedFilters).toContain('timeFrom:08:00');
      expect(result.searchMetadata.appliedFilters).toContain('timeTo:18:00');
    });

    it('should return search results with correct structure', async () => {
      const mockTripRow = {
        id: '123',
        driver_id: '456',
        origin_city: 'Quito',
        destination_city: 'Guayaquil',
        departure_date: '2024-12-01',
        departure_time: '08:00',
        estimated_arrival_time: '12:00',
        available_seats: 3,
        total_seats: 4,
        price_per_seat: 25.00,
        vehicle_info: { make: 'Toyota', model: 'Corolla', year: 2020, color: 'White', licensePlate: 'ABC-1234', vehicleType: 'sedan' },
        description: 'Test trip',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
        first_name: 'Juan',
        last_name: 'Pérez',
        profile_photo: null,
        rating: 4.5,
        total_trips: 10,
        verification_status: {
          phoneVerified: true,
          identityVerified: true,
          backgroundCheckPassed: true,
          driverLicenseVerified: true,
          vehicleRegistrationVerified: true
        },
        booked_seats: 1
      };

      mockPool.query
        .mockResolvedValueOnce({ rows: [{ total: '1' }] })
        .mockResolvedValueOnce({ rows: [mockTripRow] });

      const filters: TripSearchFilters = {
        originCity: 'Quito',
        destinationCity: 'Guayaquil'
      };

      const result = await tripSearchService.searchTripsAdvanced(filters, 1, 20);

      expect(result.total).toBe(1);
      expect(result.trips).toHaveLength(1);
      expect(result.trips[0].trip.id).toBe('123');
      expect(result.trips[0].driver.firstName).toBe('Juan');
      expect(result.trips[0].bookedSeats).toBe(1);
    });

    it('should measure search time correctly', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ total: '0' }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await tripSearchService.searchTripsAdvanced({}, 1, 20);

      expect(result.searchMetadata.searchTime).toBeGreaterThanOrEqual(0);
      expect(typeof result.searchMetadata.searchTime).toBe('number');
    });
  });

  describe('buildOrderByClause', () => {
    it('should build correct ORDER BY for price sorting', () => {
      const service = new TripSearchService(mockPool);
      const filters: TripSearchFilters = {
        sortBy: 'price',
        sortOrder: 'desc'
      };

      // Access private method for testing
      const orderBy = (service as any).buildOrderByClause(filters);
      expect(orderBy).toBe('ORDER BY t.price_per_seat DESC, t.departure_time ASC');
    });

    it('should build correct ORDER BY for departure time sorting', () => {
      const service = new TripSearchService(mockPool);
      const filters: TripSearchFilters = {
        sortBy: 'departure_time',
        sortOrder: 'asc'
      };

      const orderBy = (service as any).buildOrderByClause(filters);
      expect(orderBy).toBe('ORDER BY t.departure_date ASC, t.departure_time ASC');
    });

    it('should build correct ORDER BY for driver rating sorting', () => {
      const service = new TripSearchService(mockPool);
      const filters: TripSearchFilters = {
        sortBy: 'driver_rating',
        sortOrder: 'desc'
      };

      const orderBy = (service as any).buildOrderByClause(filters);
      expect(orderBy).toBe('ORDER BY u.rating DESC, t.departure_time ASC');
    });

    it('should use default sorting when no sort specified', () => {
      const service = new TripSearchService(mockPool);
      const filters: TripSearchFilters = {};

      const orderBy = (service as any).buildOrderByClause(filters);
      expect(orderBy).toBe('ORDER BY t.departure_date ASC, t.departure_time ASC');
    });
  });

  describe('getAppliedFilters', () => {
    it('should return correct applied filters', () => {
      const service = new TripSearchService(mockPool);
      const filters: TripSearchFilters = {
        originCity: 'Quito',
        destinationCity: 'Guayaquil',
        minPrice: 10,
        maxPrice: 50,
        minDriverRating: 4.0,
        verifiedDriversOnly: true,
        sortBy: 'price',
        sortOrder: 'asc'
      };

      const appliedFilters = (service as any).getAppliedFilters(filters);

      expect(appliedFilters).toContain('origin:Quito');
      expect(appliedFilters).toContain('destination:Guayaquil');
      expect(appliedFilters).toContain('minPrice:10');
      expect(appliedFilters).toContain('maxPrice:50');
      expect(appliedFilters).toContain('minRating:4');
      expect(appliedFilters).toContain('verifiedOnly:true');
      expect(appliedFilters).toContain('sortBy:price');
      expect(appliedFilters).toContain('sortOrder:asc');
    });

    it('should return empty array for no filters', () => {
      const service = new TripSearchService(mockPool);
      const filters: TripSearchFilters = {};

      const appliedFilters = (service as any).getAppliedFilters(filters);

      expect(appliedFilters).toEqual([]);
    });
  });
});