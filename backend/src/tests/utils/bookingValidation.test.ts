import { validateCreateBooking, validateUpdateBooking, validateSeatAvailability, canCancelBooking, canBookOwnTrip } from '../../utils/bookingValidation';
import { CreateBookingRequest } from '../../models/Booking';

describe('Booking Validation', () => {
  describe('validateCreateBooking', () => {
    const validBookingData: CreateBookingRequest = {
      tripId: '123e4567-e89b-12d3-a456-426614174000',
      seatsBooked: 2,
      paymentMethod: 'bank_transfer'
    };

    it('should validate correct booking data', () => {
      const result = validateCreateBooking(validBookingData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid seats count', () => {
      const invalidBooking = { ...validBookingData, seatsBooked: 0 };
      const result = validateCreateBooking(invalidBooking);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Seats booked must be between 1 and 8');
    });

    it('should reject invalid payment method', () => {
      const invalidBooking = { ...validBookingData, paymentMethod: 'invalid' as any };
      const result = validateCreateBooking(invalidBooking);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid payment method. Must be bank_transfer or cash');
    });
  });

  describe('validateSeatAvailability', () => {
    it('should validate sufficient seats', () => {
      const result = validateSeatAvailability(2, 4);
      expect(result.isValid).toBe(true);
    });

    it('should reject insufficient seats', () => {
      const result = validateSeatAvailability(5, 3);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Only 3 seats available, but 5 requested');
    });
  });

  describe('canCancelBooking', () => {
    it('should allow cancellation for confirmed booking in future', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      const result = canCancelBooking('confirmed', futureDate);
      expect(result.isValid).toBe(true);
    });

    it('should reject cancellation for already cancelled booking', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const result = canCancelBooking('cancelled', futureDate);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Booking is already cancelled');
    });
  });

  describe('canBookOwnTrip', () => {
    it('should allow booking different user trip', () => {
      const result = canBookOwnTrip('user1', 'user2');
      expect(result.isValid).toBe(true);
    });

    it('should reject booking own trip', () => {
      const result = canBookOwnTrip('user1', 'user1');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Cannot book your own trip');
    });
  });
});