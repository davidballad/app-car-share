import { Request, Response } from 'express';
import { TripRepository } from '../repositories/TripRepository';
import { validateCreateTrip, validateUpdateTrip, validateTripSearchFilters } from '../utils/tripValidation';
import { getPool } from '../config/database';
import { CacheService } from '../services/CacheService';
import { TripSearchService } from '../services/TripSearchService';

export class TripController {
  private tripRepository: TripRepository | null = null;
  private tripSearchService: TripSearchService | null = null;

  constructor() {
    try {
      const pool = getPool();
      this.tripRepository = new TripRepository(pool);
      this.tripSearchService = new TripSearchService(pool);
    } catch (error) {
      // Handle case where database is not initialized (e.g., in tests)
      console.warn('Database pool not initialized, some operations may fail');
    }
  }

  /**
   * Create a new trip
   * POST /api/trips
   */
  async createTrip(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          }
        });
        return;
      }

      if (!this.tripRepository) {
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Error interno del servidor'
          }
        });
        return;
      }

      // Validate request data
      const validation = validateCreateTrip(req.body);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Datos de viaje inválidos',
            details: validation.errors
          }
        });
        return;
      }

      // Check if user has required verification for creating trips
      const userVerification = await this.getUserVerificationStatus(userId);
      if (!this.canCreateTrips(userVerification)) {
        res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_VERIFICATION',
            message: 'Verificación insuficiente para crear viajes',
            requiredVerification: [
              'phoneVerified',
              'identityVerified', 
              'backgroundCheckPassed',
              'driverLicenseVerified',
              'vehicleRegistrationVerified'
            ]
          }
        });
        return;
      }

      // Create the trip
      const trip = await this.tripRepository.createTrip(userId, req.body);

      // Invalidate search and popular routes caches
      await CacheService.invalidateTripCaches();

      res.status(201).json({
        success: true,
        data: {
          trip
        },
        message: 'Viaje creado exitosamente'
      });

    } catch (error) {
      console.error('Error creating trip:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  /**
   * Update a trip
   * PUT /api/trips/:id
   */
  async updateTrip(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const tripId = req.params.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          }
        });
        return;
      }

      // Validate request data
      const validation = validateUpdateTrip(req.body);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Datos de actualización inválidos',
            details: validation.errors
          }
        });
        return;
      }

      if (!this.tripRepository) {
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Error interno del servidor'
          }
        });
        return;
      }

      // Check if trip exists and belongs to user
      const existingTrip = await this.tripRepository.getTripById(tripId);
      if (!existingTrip) {
        res.status(404).json({
          success: false,
          error: {
            code: 'TRIP_NOT_FOUND',
            message: 'Viaje no encontrado'
          }
        });
        return;
      }

      if (existingTrip.driverId !== userId) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para modificar este viaje'
          }
        });
        return;
      }

      // Check if trip has bookings and validate updates accordingly
      const hasBookings = await this.tripHasConfirmedBookings(tripId);
      if (hasBookings && this.isRestrictedUpdate(req.body)) {
        res.status(422).json({
          success: false,
          error: {
            code: 'TRIP_HAS_BOOKINGS',
            message: 'No se pueden modificar detalles principales de un viaje con reservas confirmadas'
          }
        });
        return;
      }

      // Update the trip
      const updatedTrip = await this.tripRepository.updateTrip(tripId, userId, req.body);
      if (!updatedTrip) {
        res.status(404).json({
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'No se pudo actualizar el viaje'
          }
        });
        return;
      }

      // Invalidate caches for this trip
      await CacheService.invalidateTripCaches(tripId);

      res.json({
        success: true,
        data: {
          trip: updatedTrip
        },
        message: 'Viaje actualizado exitosamente'
      });

    } catch (error) {
      console.error('Error updating trip:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  /**
   * Delete a trip
   * DELETE /api/trips/:id
   */
  async deleteTrip(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const tripId = req.params.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          }
        });
        return;
      }

      if (!this.tripRepository) {
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Error interno del servidor'
          }
        });
        return;
      }

      // Check if trip exists and belongs to user
      const existingTrip = await this.tripRepository.getTripById(tripId);
      if (!existingTrip) {
        res.status(404).json({
          success: false,
          error: {
            code: 'TRIP_NOT_FOUND',
            message: 'Viaje no encontrado'
          }
        });
        return;
      }

      if (existingTrip.driverId !== userId) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para eliminar este viaje'
          }
        });
        return;
      }

      // Get passengers before deletion for notification
      const passengers = await this.getTripPassengers(tripId);

      try {
        // Delete the trip (will fail if has bookings)
        const deleted = await this.tripRepository.deleteTrip(tripId, userId);
        
        if (!deleted) {
          res.status(404).json({
            success: false,
            error: {
              code: 'DELETE_FAILED',
              message: 'No se pudo eliminar el viaje'
            }
          });
          return;
        }

        // Notify passengers if there were any
        if (passengers.length > 0) {
          await this.notifyPassengersOfCancellation(passengers, existingTrip);
        }

        // Invalidate caches
        await CacheService.invalidateTripCaches(tripId);

        res.json({
          success: true,
          message: 'Viaje eliminado exitosamente'
        });

      } catch (error: any) {
        if (error.message === 'Cannot delete trip with existing bookings') {
          res.status(422).json({
            success: false,
            error: {
              code: 'TRIP_HAS_BOOKINGS',
              message: 'No se puede eliminar un viaje con reservas confirmadas. Cancela el viaje en su lugar.'
            }
          });
          return;
        }
        throw error;
      }

    } catch (error) {
      console.error('Error deleting trip:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  /**
   * Get trip by ID with caching
   * GET /api/trips/:id
   */
  async getTripById(req: Request, res: Response): Promise<void> {
    try {
      const tripId = req.params.id;

      if (!this.tripRepository) {
        res.status(404).json({
          success: false,
          error: {
            code: 'TRIP_NOT_FOUND',
            message: 'Viaje no encontrado'
          }
        });
        return;
      }

      // Try to get cached trip details first
      const cachedTrip = await CacheService.getCachedTripDetails(tripId);
      if (cachedTrip) {
        res.json({
          success: true,
          data: cachedTrip,
          cached: true
        });
        return;
      }

      // Get fresh data from database
      const tripWithDriver = await this.tripRepository.getTripWithDriver(tripId);
      if (!tripWithDriver) {
        res.status(404).json({
          success: false,
          error: {
            code: 'TRIP_NOT_FOUND',
            message: 'Viaje no encontrado'
          }
        });
        return;
      }

      // Cache the trip details
      await CacheService.cacheTripDetails(tripId, tripWithDriver);

      res.json({
        success: true,
        data: tripWithDriver
      });

    } catch (error) {
      console.error('Error getting trip:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  /**
   * Search trips with caching and enhanced filters
   * GET /api/trips
   */
  async searchTrips(req: Request, res: Response): Promise<void> {
    try {
      // Validate search filters
      const validation = validateTripSearchFilters(req.query);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Filtros de búsqueda inválidos',
            details: validation.errors
          }
        });
        return;
      }

      if (!this.tripRepository) {
        res.json({
          success: true,
          data: {
            trips: [],
            pagination: {
              page: 1,
              limit: 20,
              total: 0,
              totalPages: 0
            }
          }
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

      // Try to get cached results first
      const cachedResult = await CacheService.getCachedSearchResults(req.query, page, limit);
      if (cachedResult) {
        res.json({
          success: true,
          data: {
            trips: cachedResult.trips,
            pagination: {
              page,
              limit,
              total: cachedResult.total,
              totalPages: cachedResult.totalPages
            }
          },
          cached: true
        });
        return;
      }

      // Get fresh results from database
      const result = await this.tripRepository.searchTrips(req.query, page, limit);

      // Cache the results
      await CacheService.cacheSearchResults(req.query, page, limit, result);

      // If no results found, get alternative suggestions
      let suggestions = null;
      if (result.total === 0) {
        suggestions = await this.tripRepository.getAlternativeTripSuggestions(req.query);
      }

      res.json({
        success: true,
        data: {
          trips: result.trips,
          pagination: {
            page,
            limit,
            total: result.total,
            totalPages: result.totalPages
          },
          suggestions: suggestions
        }
      });

    } catch (error) {
      console.error('Error searching trips:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  /**
   * Advanced search trips with intelligent optimization
   * GET /api/trips/advanced-search
   */
  async searchTripsAdvanced(req: Request, res: Response): Promise<void> {
    try {
      // Validate search filters
      const validation = validateTripSearchFilters(req.query);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Filtros de búsqueda inválidos',
            details: validation.errors
          }
        });
        return;
      }

      if (!this.tripSearchService) {
        res.json({
          success: true,
          data: {
            trips: [],
            pagination: {
              page: 1,
              limit: 20,
              total: 0,
              totalPages: 0
            },
            searchMetadata: {
              appliedFilters: [],
              searchTime: 0,
              cached: false
            }
          }
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

      // Use advanced search service
      const result = await this.tripSearchService.searchTripsAdvanced(req.query, page, limit);

      res.json({
        success: true,
        data: {
          trips: result.trips,
          pagination: {
            page,
            limit,
            total: result.total,
            totalPages: result.totalPages
          },
          searchMetadata: result.searchMetadata
        }
      });

    } catch (error) {
      console.error('Error in advanced search:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  /**
   * Get search suggestions when no results found
   * GET /api/trips/search/suggestions
   */
  async getSearchSuggestions(req: Request, res: Response): Promise<void> {
    try {
      // Validate search filters
      const validation = validateTripSearchFilters(req.query);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Filtros de búsqueda inválidos',
            details: validation.errors
          }
        });
        return;
      }

      if (!this.tripRepository) {
        res.json({
          success: true,
          data: {
            alternativeDates: [],
            nearbyRoutes: [],
            popularRoutes: []
          }
        });
        return;
      }

      const suggestions = await this.tripRepository.getAlternativeTripSuggestions(req.query);

      res.json({
        success: true,
        data: suggestions
      });

    } catch (error) {
      console.error('Error getting search suggestions:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  /**
   * Get trips by driver (current user)
   * GET /api/trips/my-trips
   */
  async getMyTrips(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          }
        });
        return;
      }

      if (!this.tripRepository) {
        res.json({
          success: true,
          data: {
            trips: []
          }
        });
        return;
      }

      const status = req.query.status as string;
      const trips = await this.tripRepository.getTripsByDriver(userId, status);

      res.json({
        success: true,
        data: {
          trips
        }
      });

    } catch (error) {
      console.error('Error getting user trips:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  /**
   * Get popular routes with caching
   * GET /api/trips/popular-routes
   */
  async getPopularRoutes(req: Request, res: Response): Promise<void> {
    try {
      if (!this.tripRepository) {
        res.json({
          success: true,
          data: {
            routes: []
          }
        });
        return;
      }

      // Try to get cached popular routes first
      const cachedRoutes = await CacheService.getCachedPopularRoutes();
      if (cachedRoutes) {
        res.json({
          success: true,
          data: {
            routes: cachedRoutes
          },
          cached: true
        });
        return;
      }

      // Get fresh data from database
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 20);
      const routes = await this.tripRepository.getPopularRoutes(limit);

      // Cache the results
      await CacheService.cachePopularRoutes(routes);

      res.json({
        success: true,
        data: {
          routes
        }
      });

    } catch (error) {
      console.error('Error getting popular routes:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Helper methods

  private async getUserVerificationStatus(userId: string): Promise<any> {
    try {
      const pool = getPool();
      const query = `
        SELECT verification_status FROM users WHERE id = $1
      `;
      const result = await pool.query(query, [userId]);
      return result.rows[0]?.verification_status || {};
    } catch (error) {
      return {};
    }
  }

  private canCreateTrips(verificationStatus: any): boolean {
    return verificationStatus.phoneVerified &&
           verificationStatus.identityVerified &&
           verificationStatus.backgroundCheckPassed &&
           verificationStatus.driverLicenseVerified &&
           verificationStatus.vehicleRegistrationVerified;
  }

  private async tripHasConfirmedBookings(tripId: string): Promise<boolean> {
    try {
      const pool = getPool();
      const query = `
        SELECT COUNT(*) as count
        FROM bookings 
        WHERE trip_id = $1 AND status IN ('confirmed', 'completed')
      `;
      const result = await pool.query(query, [tripId]);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      return false;
    }
  }

  private isRestrictedUpdate(updateData: any): boolean {
    // These fields cannot be updated if trip has bookings
    const restrictedFields = [
      'departureDate',
      'departureTime', 
      'estimatedArrivalTime',
      'availableSeats'
    ];
    
    return restrictedFields.some(field => updateData[field] !== undefined);
  }

  private async getTripPassengers(tripId: string): Promise<any[]> {
    try {
      const pool = getPool();
      const query = `
        SELECT DISTINCT u.id, u.email, u.first_name, u.last_name
        FROM bookings b
        JOIN users u ON b.passenger_id = u.id
        WHERE b.trip_id = $1 AND b.status IN ('confirmed', 'completed')
      `;
      const result = await pool.query(query, [tripId]);
      return result.rows;
    } catch (error) {
      return [];
    }
  }

  private async notifyPassengersOfCancellation(passengers: any[], trip: any): Promise<void> {
    // TODO: Implement notification service
    // For now, just log the notification
    console.log(`Notifying ${passengers.length} passengers of trip cancellation:`, {
      tripId: trip.id,
      route: `${trip.originCity} → ${trip.destinationCity}`,
      departureDate: trip.departureDate,
      passengers: passengers.map(p => ({ id: p.id, email: p.email }))
    });
  }
}