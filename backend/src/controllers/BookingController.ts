import { Request, Response } from 'express';
import { BookingRepository } from '../repositories/BookingRepository';
import { TripRepository } from '../repositories/TripRepository';
import { validateCreateBooking, validateUpdateBooking, canBookOwnTrip } from '../utils/bookingValidation';
import { getPool } from '../config/database';
import { generateWhatsAppURL, WhatsAppMessages } from '../utils/whatsappHelper';
import { NotificationService } from '../services/NotificationService';

export class BookingController {
  private bookingRepository: BookingRepository | null = null;
  private tripRepository: TripRepository | null = null;
  private notificationService: NotificationService | null = null;

  constructor() {
    try {
      const pool = getPool();
      this.bookingRepository = new BookingRepository(pool);
      this.tripRepository = new TripRepository(pool);
      this.notificationService = new NotificationService(pool);
    } catch (error) {
      console.warn('Database pool not initialized, some operations may fail');
    }
  }

  /**
   * Create a new booking
   * POST /api/bookings
   */
  async createBooking(req: Request, res: Response): Promise<void> {
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

      if (!this.bookingRepository || !this.tripRepository) {
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
      const validation = validateCreateBooking(req.body);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Datos de reserva inválidos',
            details: validation.errors
          }
        });
        return;
      }

      // Check if trip exists and get driver info
      const trip = await this.tripRepository.getTripById(req.body.tripId);
      if (!trip) {
        res.status(404).json({
          success: false,
          error: {
            code: 'TRIP_NOT_FOUND',
            message: 'Viaje no encontrado'
          }
        });
        return;
      }

      // Check if user is trying to book their own trip
      const ownTripValidation = canBookOwnTrip(userId, trip.driverId);
      if (!ownTripValidation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_BOOKING',
            message: ownTripValidation.errors[0]
          }
        });
        return;
      }

      // Create the booking
      const booking = await this.bookingRepository.createBooking(userId, req.body);

      // Send notifications
      if (this.notificationService) {
        // Notify passenger
        await this.notificationService.sendBookingConfirmation(userId, {
          originCity: trip.originCity,
          destinationCity: trip.destinationCity,
          departureDate: trip.departureDate,
          departureTime: trip.departureTime
        });

        // Notify driver
        await this.notificationService.sendBookingConfirmation(trip.driverId, {
          originCity: trip.originCity,
          destinationCity: trip.destinationCity,
          departureDate: trip.departureDate,
          departureTime: trip.departureTime
        });
      }

      res.status(201).json({
        success: true,
        data: {
          booking
        },
        message: 'Reserva creada exitosamente'
      });

    } catch (error: any) {
      console.error('Error creating booking:', error);
      
      if (error.message.includes('seats available') || error.message.includes('not available')) {
        res.status(409).json({
          success: false,
          error: {
            code: 'BOOKING_CONFLICT',
            message: error.message
          }
        });
        return;
      }

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
   * Get booking by ID
   * GET /api/bookings/:id
   */
  async getBookingById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const bookingId = req.params.id;

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

      if (!this.bookingRepository) {
        res.status(404).json({
          success: false,
          error: {
            code: 'BOOKING_NOT_FOUND',
            message: 'Reserva no encontrada'
          }
        });
        return;
      }

      const bookingWithDetails = await this.bookingRepository.getBookingWithDetails(bookingId);
      if (!bookingWithDetails) {
        res.status(404).json({
          success: false,
          error: {
            code: 'BOOKING_NOT_FOUND',
            message: 'Reserva no encontrada'
          }
        });
        return;
      }

      // Check if user has access to this booking (passenger or driver)
      const isPassenger = bookingWithDetails.booking.passengerId === userId;
      const isDriver = bookingWithDetails.trip.driverId === userId;

      if (!isPassenger && !isDriver) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para ver esta reserva'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: bookingWithDetails
      });

    } catch (error) {
      console.error('Error getting booking:', error);
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
   * Update booking status
   * PUT /api/bookings/:id
   */
  async updateBooking(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const bookingId = req.params.id;

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
      const validation = validateUpdateBooking(req.body);
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

      if (!this.bookingRepository) {
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Error interno del servidor'
          }
        });
        return;
      }

      // Check if booking exists and user has permission
      const bookingWithDetails = await this.bookingRepository.getBookingWithDetails(bookingId);
      if (!bookingWithDetails) {
        res.status(404).json({
          success: false,
          error: {
            code: 'BOOKING_NOT_FOUND',
            message: 'Reserva no encontrada'
          }
        });
        return;
      }

      const isPassenger = bookingWithDetails.booking.passengerId === userId;
      const isDriver = bookingWithDetails.trip.driverId === userId;

      if (!isPassenger && !isDriver) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para modificar esta reserva'
          }
        });
        return;
      }

      // Update the booking
      const updatedBooking = await this.bookingRepository.updateBooking(bookingId, req.body);
      if (!updatedBooking) {
        res.status(404).json({
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'No se pudo actualizar la reserva'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: {
          booking: updatedBooking
        },
        message: 'Reserva actualizada exitosamente'
      });

    } catch (error) {
      console.error('Error updating booking:', error);
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
   * Cancel booking
   * DELETE /api/bookings/:id
   */
  async cancelBooking(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const bookingId = req.params.id;
      const { cancellationReason } = req.body;

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

      if (!cancellationReason) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Motivo de cancelación requerido'
          }
        });
        return;
      }

      if (!this.bookingRepository) {
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Error interno del servidor'
          }
        });
        return;
      }

      // Check if booking exists and user has permission
      const bookingWithDetails = await this.bookingRepository.getBookingWithDetails(bookingId);
      if (!bookingWithDetails) {
        res.status(404).json({
          success: false,
          error: {
            code: 'BOOKING_NOT_FOUND',
            message: 'Reserva no encontrada'
          }
        });
        return;
      }

      const isPassenger = bookingWithDetails.booking.passengerId === userId;
      const isDriver = bookingWithDetails.trip.driverId === userId;

      if (!isPassenger && !isDriver) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para cancelar esta reserva'
          }
        });
        return;
      }

      // Cancel the booking
      await this.bookingRepository.cancelBooking(bookingId, cancellationReason);

      // Send cancellation notifications
      if (this.notificationService) {
        const template = NotificationService.getTemplate('booking_cancelled', {
          route: `${bookingWithDetails.trip.originCity} → ${bookingWithDetails.trip.destinationCity}`
        });

        // Notify passenger
        await this.notificationService.createNotification({
          userId: bookingWithDetails.booking.passengerId,
          type: 'booking_cancelled',
          title: template.title,
          message: template.message,
          data: { reason: cancellationReason }
        });

        // Notify driver
        await this.notificationService.createNotification({
          userId: bookingWithDetails.trip.driverId,
          type: 'booking_cancelled',
          title: template.title,
          message: template.message,
          data: { reason: cancellationReason }
        });
      }

      res.json({
        success: true,
        message: 'Reserva cancelada exitosamente'
      });

    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      
      if (error.message.includes('already cancelled') || error.message.includes('Cannot cancel')) {
        res.status(409).json({
          success: false,
          error: {
            code: 'CANCELLATION_NOT_ALLOWED',
            message: error.message
          }
        });
        return;
      }

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
   * Get user's bookings (as passenger)
   * GET /api/bookings/my-bookings
   */
  async getMyBookings(req: Request, res: Response): Promise<void> {
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

      if (!this.bookingRepository) {
        res.json({
          success: true,
          data: {
            bookings: []
          }
        });
        return;
      }

      const status = req.query.status as any;
      const bookings = await this.bookingRepository.getBookingsByPassenger(userId, status);

      res.json({
        success: true,
        data: {
          bookings
        }
      });

    } catch (error) {
      console.error('Error getting user bookings:', error);
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
   * Get bookings for a trip (for drivers)
   * GET /api/bookings/trip/:tripId
   */
  async getTripBookings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const tripId = req.params.tripId;

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

      if (!this.bookingRepository || !this.tripRepository) {
        res.json({
          success: true,
          data: {
            bookings: []
          }
        });
        return;
      }

      // Check if user is the driver of this trip
      const trip = await this.tripRepository.getTripById(tripId);
      if (!trip) {
        res.status(404).json({
          success: false,
          error: {
            code: 'TRIP_NOT_FOUND',
            message: 'Viaje no encontrado'
          }
        });
        return;
      }

      if (trip.driverId !== userId) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para ver las reservas de este viaje'
          }
        });
        return;
      }

      const bookings = await this.bookingRepository.getBookingsForTrip(tripId);

      res.json({
        success: true,
        data: {
          bookings
        }
      });

    } catch (error) {
      console.error('Error getting trip bookings:', error);
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
   * Get WhatsApp contact URL for booking participants
   * GET /api/bookings/:id/whatsapp-contact
   */
  async getWhatsAppContact(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const bookingId = req.params.id;

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

      if (!this.bookingRepository) {
        res.status(404).json({
          success: false,
          error: {
            code: 'BOOKING_NOT_FOUND',
            message: 'Reserva no encontrada'
          }
        });
        return;
      }

      const bookingWithDetails = await this.bookingRepository.getBookingWithDetails(bookingId);
      if (!bookingWithDetails) {
        res.status(404).json({
          success: false,
          error: {
            code: 'BOOKING_NOT_FOUND',
            message: 'Reserva no encontrada'
          }
        });
        return;
      }

      // Check if user has access to this booking
      const isPassenger = bookingWithDetails.booking.passengerId === userId;
      const isDriver = bookingWithDetails.trip.driverId === userId;

      if (!isPassenger && !isDriver) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para contactar en esta reserva'
          }
        });
        return;
      }

      // Get the phone number of the person to contact
      let contactPhone: string;
      let contactName: string;
      let messageTemplate: string;

      if (isPassenger) {
        // Passenger wants to contact driver - need to get driver's phone
        const driverQuery = `SELECT phone FROM users WHERE id = $1`;
        const driverResult = await getPool().query(driverQuery, [bookingWithDetails.trip.driverId]);
        
        if (driverResult.rows.length === 0) {
          res.status(404).json({
            success: false,
            error: {
              code: 'CONTACT_NOT_FOUND',
              message: 'Información de contacto no disponible'
            }
          });
          return;
        }

        contactPhone = driverResult.rows[0].phone;
        contactName = `${bookingWithDetails.driver.firstName} ${bookingWithDetails.driver.lastName}`;
        messageTemplate = WhatsAppMessages.passengerToDriver({
          originCity: bookingWithDetails.trip.originCity,
          destinationCity: bookingWithDetails.trip.destinationCity,
          departureDate: bookingWithDetails.trip.departureDate.toLocaleDateString('es-EC'),
          departureTime: bookingWithDetails.trip.departureTime
        });
      } else {
        // Driver wants to contact passenger
        const passengerQuery = `SELECT phone FROM users WHERE id = $1`;
        const passengerResult = await getPool().query(passengerQuery, [bookingWithDetails.booking.passengerId]);
        
        if (passengerResult.rows.length === 0) {
          res.status(404).json({
            success: false,
            error: {
              code: 'CONTACT_NOT_FOUND',
              message: 'Información de contacto no disponible'
            }
          });
          return;
        }

        contactPhone = passengerResult.rows[0].phone;
        contactName = `${bookingWithDetails.passenger.firstName} ${bookingWithDetails.passenger.lastName}`;
        messageTemplate = WhatsAppMessages.driverToPassenger({
          originCity: bookingWithDetails.trip.originCity,
          destinationCity: bookingWithDetails.trip.destinationCity,
          departureDate: bookingWithDetails.trip.departureDate.toLocaleDateString('es-EC'),
          departureTime: bookingWithDetails.trip.departureTime
        });
      }

      // Generate WhatsApp URL
      const whatsappURL = generateWhatsAppURL(contactPhone, messageTemplate);

      res.json({
        success: true,
        data: {
          whatsappURL,
          contactName,
          contactPhone,
          message: messageTemplate
        }
      });

    } catch (error) {
      console.error('Error generating WhatsApp contact:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }
}