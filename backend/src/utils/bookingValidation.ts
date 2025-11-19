import { CreateBookingRequest, UpdateBookingRequest, BookingValidationResult, PaymentMethod, BookingStatus } from '../models/Booking';

/**
 * Validate booking creation data
 */
export function validateCreateBooking(bookingData: CreateBookingRequest): BookingValidationResult {
  const errors: string[] = [];

  // Validate trip ID
  if (!bookingData.tripId || typeof bookingData.tripId !== 'string') {
    errors.push('Trip ID is required');
  }

  // Validate seats booked
  if (!Number.isInteger(bookingData.seatsBooked) || bookingData.seatsBooked < 1 || bookingData.seatsBooked > 8) {
    errors.push('Seats booked must be between 1 and 8');
  }

  // Validate payment method
  const validPaymentMethods: PaymentMethod[] = ['bank_transfer', 'cash'];
  if (!validPaymentMethods.includes(bookingData.paymentMethod)) {
    errors.push('Invalid payment method. Must be bank_transfer or cash');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate booking update data
 */
export function validateUpdateBooking(updateData: UpdateBookingRequest): BookingValidationResult {
  const errors: string[] = [];

  // Validate booking status if provided
  if (updateData.status) {
    const validBookingStatuses: BookingStatus[] = ['confirmed', 'cancelled', 'completed'];
    if (!validBookingStatuses.includes(updateData.status)) {
      errors.push('Invalid booking status');
    }
  }

  // Validate cancellation reason if status is cancelled
  if (updateData.status === 'cancelled' && !updateData.cancellationReason) {
    errors.push('Cancellation reason is required when cancelling booking');
  }

  // Validate cancellation reason length
  if (updateData.cancellationReason && updateData.cancellationReason.length > 500) {
    errors.push('Cancellation reason cannot exceed 500 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate seat availability for booking
 */
export function validateSeatAvailability(requestedSeats: number, availableSeats: number): BookingValidationResult {
  const errors: string[] = [];

  if (requestedSeats > availableSeats) {
    errors.push(`Only ${availableSeats} seats available, but ${requestedSeats} requested`);
  }

  if (availableSeats === 0) {
    errors.push('No seats available for this trip');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Check if booking can be cancelled
 */
export function canCancelBooking(bookingStatus: BookingStatus, departureDate: Date): BookingValidationResult {
  const errors: string[] = [];

  // Check booking status
  if (bookingStatus === 'cancelled') {
    errors.push('Booking is already cancelled');
  }

  if (bookingStatus === 'completed') {
    errors.push('Cannot cancel completed booking');
  }

  // Check if trip has already departed (allow cancellation up to 2 hours before departure)
  const now = new Date();
  const twoHoursBeforeDeparture = new Date(departureDate.getTime() - (2 * 60 * 60 * 1000));
  
  if (now > twoHoursBeforeDeparture) {
    errors.push('Cannot cancel booking less than 2 hours before departure');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calculate booking total amount
 */
export function calculateBookingAmount(pricePerSeat: number, seatsBooked: number): number {
  return pricePerSeat * seatsBooked;
}

/**
 * Check if user can book their own trip
 */
export function canBookOwnTrip(passengerId: string, driverId: string): BookingValidationResult {
  const errors: string[] = [];

  if (passengerId === driverId) {
    errors.push('Cannot book your own trip');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}