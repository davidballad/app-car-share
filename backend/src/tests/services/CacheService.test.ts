import { CacheService } from '../../services/CacheService';
import { TripSearchFilters, TripWithDriver } from '../../models/Trip';

// Mock Redis client
const mockRedisClient = {
  setEx: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
  keys: jest.fn()
};

// Mock getRedisClient
jest.mock('../../config/redis', () => ({
  getRedisClient: () => mockRedisClient
}));

describe('CacheService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('cacheSearchResults', () => {
    it('should cache search results with correct key and TTL', async () => {
      const filters: TripSearchFilters = {
        originCity: 'Quito',
        destinationCity: 'Guayaquil'
      };
      const results = {
        trips: [] as TripWithDriver[],
        total: 0,
        totalPages: 0
      };

      mockRedisClient.setEx.mockResolvedValue('OK');

      await CacheService.cacheSearchResults(filters, 1, 20, results);

      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        expect.stringMatching(/^trip_search:/),
        300, // 5 minutes TTL
        JSON.stringify(results)
      );
    });

    it('should handle caching errors gracefully', async () => {
      const filters: TripSearchFilters = {};
      const results = {
        trips: [] as TripWithDriver[],
        total: 0,
        totalPages: 0
      };

      mockRedisClient.setEx.mockRejectedValue(new Error('Redis error'));

      // Should not throw error
      await expect(CacheService.cacheSearchResults(filters, 1, 20, results)).resolves.toBeUndefined();
    });
  });

  describe('getCachedSearchResults', () => {
    it('should return cached results when available', async () => {
      const filters: TripSearchFilters = {
        originCity: 'Quito'
      };
      const cachedData = {
        trips: [],
        total: 5,
        totalPages: 1
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await CacheService.getCachedSearchResults(filters, 1, 20);

      expect(result).toEqual(cachedData);
      expect(mockRedisClient.get).toHaveBeenCalledWith(
        expect.stringMatching(/^trip_search:/)
      );
    });

    it('should return null when no cached data', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await CacheService.getCachedSearchResults({}, 1, 20);

      expect(result).toBeNull();
    });

    it('should handle cache retrieval errors gracefully', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('Redis error'));

      const result = await CacheService.getCachedSearchResults({}, 1, 20);

      expect(result).toBeNull();
    });
  });

  describe('cachePopularRoutes', () => {
    it('should cache popular routes with correct TTL', async () => {
      const routes = [
        { originCity: 'Quito', destinationCity: 'Guayaquil', tripCount: 10 }
      ];

      mockRedisClient.setEx.mockResolvedValue('OK');

      await CacheService.cachePopularRoutes(routes);

      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        'popular_routes',
        3600, // 1 hour TTL
        JSON.stringify(routes)
      );
    });
  });

  describe('getCachedPopularRoutes', () => {
    it('should return cached popular routes', async () => {
      const routes = [
        { originCity: 'Quito', destinationCity: 'Guayaquil', tripCount: 10 }
      ];

      mockRedisClient.get.mockResolvedValue(JSON.stringify(routes));

      const result = await CacheService.getCachedPopularRoutes();

      expect(result).toEqual(routes);
      expect(mockRedisClient.get).toHaveBeenCalledWith('popular_routes');
    });

    it('should return null when no cached routes', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await CacheService.getCachedPopularRoutes();

      expect(result).toBeNull();
    });
  });

  describe('cacheTripDetails', () => {
    it('should cache trip details with correct key and TTL', async () => {
      const tripId = '123';
      const tripData = {
        trip: {
          id: '123',
          driverId: '456',
          originCity: 'Quito',
          destinationCity: 'Guayaquil',
          departureDate: new Date('2024-12-01'),
          departureTime: '08:00',
          estimatedArrivalTime: '12:00',
          availableSeats: 3,
          totalSeats: 4,
          pricePerSeat: 25.00,
          vehicleInfo: {
            make: 'Toyota',
            model: 'Corolla',
            year: 2020,
            color: 'White',
            licensePlate: 'ABC-1234',
            vehicleType: 'sedan' as const
          },
          description: 'Test trip',
          status: 'active' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        driver: {
          id: '456',
          firstName: 'Juan',
          lastName: 'Pérez',
          profilePhoto: null,
          rating: 4.5,
          totalTrips: 10,
          verificationStatus: {
            phoneVerified: true,
            identityVerified: true,
            backgroundCheckPassed: true,
            driverLicenseVerified: true,
            vehicleRegistrationVerified: true
          }
        },
        bookedSeats: 1
      };

      mockRedisClient.setEx.mockResolvedValue('OK');

      await CacheService.cacheTripDetails(tripId, tripData);

      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        `trip_details:${tripId}`,
        600, // 10 minutes TTL
        JSON.stringify(tripData)
      );
    });
  });

  describe('getCachedTripDetails', () => {
    it('should return cached trip details', async () => {
      const tripId = '123';
      const tripData = {
        trip: { id: '123' },
        driver: { id: '456' },
        bookedSeats: 1
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(tripData));

      const result = await CacheService.getCachedTripDetails(tripId);

      expect(result).toEqual(tripData);
      expect(mockRedisClient.get).toHaveBeenCalledWith(`trip_details:${tripId}`);
    });
  });

  describe('invalidateTripCaches', () => {
    it('should invalidate all trip-related caches', async () => {
      const searchKeys = ['trip_search:key1', 'trip_search:key2'];
      
      mockRedisClient.keys.mockResolvedValue(searchKeys);
      mockRedisClient.del.mockResolvedValue(2);

      await CacheService.invalidateTripCaches();

      expect(mockRedisClient.keys).toHaveBeenCalledWith('trip_search:*');
      expect(mockRedisClient.del).toHaveBeenCalledWith(searchKeys);
      expect(mockRedisClient.del).toHaveBeenCalledWith('popular_routes');
    });

    it('should invalidate specific trip details when tripId provided', async () => {
      const tripId = '123';
      const searchKeys = ['trip_search:key1'];
      
      mockRedisClient.keys.mockResolvedValue(searchKeys);
      mockRedisClient.del.mockResolvedValue(1);

      await CacheService.invalidateTripCaches(tripId);

      expect(mockRedisClient.del).toHaveBeenCalledWith(`trip_details:${tripId}`);
    });

    it('should handle invalidation errors gracefully', async () => {
      mockRedisClient.keys.mockRejectedValue(new Error('Redis error'));

      // Should not throw error
      await expect(CacheService.invalidateTripCaches()).resolves.toBeUndefined();
    });
  });

  describe('clearAllTripCaches', () => {
    it('should clear all trip-related caches', async () => {
      const allTripKeys = ['trip_search:key1', 'trip_details:123'];
      
      mockRedisClient.keys.mockResolvedValue(allTripKeys);
      mockRedisClient.del.mockResolvedValue(2);

      await CacheService.clearAllTripCaches();

      expect(mockRedisClient.keys).toHaveBeenCalledWith('trip_*');
      expect(mockRedisClient.del).toHaveBeenCalledWith(allTripKeys);
      expect(mockRedisClient.del).toHaveBeenCalledWith('popular_routes');
    });

    it('should handle no keys to delete', async () => {
      mockRedisClient.keys.mockResolvedValue([]);

      await CacheService.clearAllTripCaches();

      expect(mockRedisClient.del).toHaveBeenCalledWith('popular_routes');
      // Should not call del with empty array
      expect(mockRedisClient.del).toHaveBeenCalledTimes(1);
    });
  });
});