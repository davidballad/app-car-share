import { getRedisClient } from '../config/redis';
import { TripWithDriver, TripSearchFilters } from '../models/Trip';

export class CacheService {
  private static readonly CACHE_TTL = {
    SEARCH_RESULTS: 300, // 5 minutes
    POPULAR_ROUTES: 3600, // 1 hour
    TRIP_DETAILS: 600, // 10 minutes
  };

  /**
   * Generate cache key for trip search results
   */
  private static generateSearchCacheKey(filters: TripSearchFilters, page: number, limit: number): string {
    const filterString = JSON.stringify({
      ...filters,
      page,
      limit
    });
    return `trip_search:${Buffer.from(filterString).toString('base64')}`;
  }

  /**
   * Cache trip search results
   */
  static async cacheSearchResults(
    filters: TripSearchFilters,
    page: number,
    limit: number,
    results: {
      trips: TripWithDriver[];
      total: number;
      totalPages: number;
    }
  ): Promise<void> {
    try {
      const redisClient = getRedisClient();
      const cacheKey = this.generateSearchCacheKey(filters, page, limit);
      
      await redisClient.setEx(
        cacheKey,
        this.CACHE_TTL.SEARCH_RESULTS,
        JSON.stringify(results)
      );
    } catch (error) {
      console.error('Error caching search results:', error);
      // Don't throw error - caching is optional
    }
  }

  /**
   * Get cached trip search results
   */
  static async getCachedSearchResults(
    filters: TripSearchFilters,
    page: number,
    limit: number
  ): Promise<{
    trips: TripWithDriver[];
    total: number;
    totalPages: number;
  } | null> {
    try {
      const redisClient = getRedisClient();
      const cacheKey = this.generateSearchCacheKey(filters, page, limit);
      
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached search results:', error);
      return null;
    }
  }

  /**
   * Cache popular routes
   */
  static async cachePopularRoutes(
    routes: Array<{ originCity: string; destinationCity: string; tripCount: number }>
  ): Promise<void> {
    try {
      const redisClient = getRedisClient();
      const cacheKey = 'popular_routes';
      
      await redisClient.setEx(
        cacheKey,
        this.CACHE_TTL.POPULAR_ROUTES,
        JSON.stringify(routes)
      );
    } catch (error) {
      console.error('Error caching popular routes:', error);
    }
  }

  /**
   * Get cached popular routes
   */
  static async getCachedPopularRoutes(): Promise<Array<{
    originCity: string;
    destinationCity: string;
    tripCount: number;
  }> | null> {
    try {
      const redisClient = getRedisClient();
      const cacheKey = 'popular_routes';
      
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached popular routes:', error);
      return null;
    }
  }

  /**
   * Cache trip details
   */
  static async cacheTripDetails(tripId: string, tripData: TripWithDriver): Promise<void> {
    try {
      const redisClient = getRedisClient();
      const cacheKey = `trip_details:${tripId}`;
      
      await redisClient.setEx(
        cacheKey,
        this.CACHE_TTL.TRIP_DETAILS,
        JSON.stringify(tripData)
      );
    } catch (error) {
      console.error('Error caching trip details:', error);
    }
  }

  /**
   * Get cached trip details
   */
  static async getCachedTripDetails(tripId: string): Promise<TripWithDriver | null> {
    try {
      const redisClient = getRedisClient();
      const cacheKey = `trip_details:${tripId}`;
      
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached trip details:', error);
      return null;
    }
  }

  /**
   * Invalidate trip-related caches when trip data changes
   */
  static async invalidateTripCaches(tripId?: string): Promise<void> {
    try {
      const redisClient = getRedisClient();
      
      // Invalidate search result caches
      const searchKeys = await redisClient.keys('trip_search:*');
      if (searchKeys.length > 0) {
        await redisClient.del(searchKeys);
      }
      
      // Invalidate popular routes cache
      await redisClient.del('popular_routes');
      
      // Invalidate specific trip details if tripId provided
      if (tripId) {
        await redisClient.del(`trip_details:${tripId}`);
      }
    } catch (error) {
      console.error('Error invalidating trip caches:', error);
    }
  }

  /**
   * Clear all trip-related caches
   */
  static async clearAllTripCaches(): Promise<void> {
    try {
      const redisClient = getRedisClient();
      
      const allTripKeys = await redisClient.keys('trip_*');
      if (allTripKeys.length > 0) {
        await redisClient.del(allTripKeys);
      }
      
      await redisClient.del('popular_routes');
    } catch (error) {
      console.error('Error clearing all trip caches:', error);
    }
  }
}