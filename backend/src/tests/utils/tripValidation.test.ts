import { validateCreateTrip, validateVehicleInfo, isValidEcuadorLicensePlate, validateTripSearchFilters } from '../../utils/tripValidation';
import { CreateTripRequest, VehicleInfo } from '../../models/Trip';

describe('Trip Validation', () => {
  const validVehicleInfo: VehicleInfo = {
    make: 'Toyota',
    model: 'Corolla',
    year: 2020,
    color: 'Blanco',
    licensePlate: 'ABC-1234',
    vehicleType: 'sedan'
  };

  const validTripData: CreateTripRequest = {
    originCity: 'Quito',
    destinationCity: 'Guayaquil',
    departureDate: '2025-12-25',
    departureTime: '08:00',
    estimatedArrivalTime: '16:00',
    availableSeats: 3,
    pricePerSeat: 25.50,
    vehicleInfo: validVehicleInfo,
    description: 'Viaje cómodo y seguro'
  };

  describe('validateCreateTrip', () => {
    it('should validate correct trip data', () => {
      const result = validateCreateTrip(validTripData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid cities', () => {
      const invalidTrip = { ...validTripData, originCity: 'InvalidCity' };
      const result = validateCreateTrip(invalidTrip);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid origin city. Must be a valid Ecuador city.');
    });

    it('should reject same origin and destination', () => {
      const invalidTrip = { ...validTripData, destinationCity: 'Quito' };
      const result = validateCreateTrip(invalidTrip);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Origin and destination cities must be different.');
    });

    it('should reject invalid seat count', () => {
      const invalidTrip = { ...validTripData, availableSeats: 0 };
      const result = validateCreateTrip(invalidTrip);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Available seats must be between 1 and 8.');
    });

    it('should reject invalid price', () => {
      const invalidTrip = { ...validTripData, pricePerSeat: -5 };
      const result = validateCreateTrip(invalidTrip);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Price per seat must be between $0.01 and $1000.');
    });
  });

  describe('validateVehicleInfo', () => {
    it('should validate correct vehicle info', () => {
      const result = validateVehicleInfo(validVehicleInfo);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing make', () => {
      const invalidVehicle = { ...validVehicleInfo, make: '' };
      const result = validateVehicleInfo(invalidVehicle);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Vehicle make is required.');
    });

    it('should reject invalid year', () => {
      const invalidVehicle = { ...validVehicleInfo, year: 1980 };
      const result = validateVehicleInfo(invalidVehicle);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Vehicle year must be between 1990');
    });
  });

  describe('isValidEcuadorLicensePlate', () => {
    it('should validate correct license plates', () => {
      expect(isValidEcuadorLicensePlate('ABC-1234')).toBe(true);
      expect(isValidEcuadorLicensePlate('AB-5678')).toBe(true);
    });

    it('should reject invalid license plates', () => {
      expect(isValidEcuadorLicensePlate('ABCD-1234')).toBe(false);
      expect(isValidEcuadorLicensePlate('AB-12345')).toBe(false);
      expect(isValidEcuadorLicensePlate('AB1234')).toBe(false);
    });
  });

  describe('validateTripSearchFilters', () => {
    it('should validate valid search filters', () => {
      const filters = {
        originCity: 'Quito',
        destinationCity: 'Guayaquil',
        departureDate: '2024-12-01',
        minPrice: 10,
        maxPrice: 50,
        minSeats: 2,
        sortBy: 'price',
        sortOrder: 'asc'
      };

      const result = validateTripSearchFilters(filters);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate enhanced search filters', () => {
      const filters = {
        originCity: 'Quito',
        destinationCity: 'Guayaquil',
        minDriverRating: 4.5,
        verifiedDriversOnly: true,
        departureTimeFrom: '08:00',
        departureTimeTo: '18:00',
        sortBy: 'driver_rating',
        sortOrder: 'desc'
      };

      const result = validateTripSearchFilters(filters);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid origin city', () => {
      const filters = {
        originCity: 'InvalidCity'
      };

      const result = validateTripSearchFilters(filters);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid origin city.');
    });

    it('should reject invalid minimum driver rating', () => {
      const filters = {
        minDriverRating: 6
      };

      const result = validateTripSearchFilters(filters);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Minimum driver rating must be between 0 and 5.');
    });

    it('should reject invalid departure time format', () => {
      const filters = {
        departureTimeFrom: '25:00'
      };

      const result = validateTripSearchFilters(filters);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid departure time from format. Use HH:MM format.');
    });

    it('should reject when departure time from is after departure time to', () => {
      const filters = {
        departureTimeFrom: '18:00',
        departureTimeTo: '08:00'
      };

      const result = validateTripSearchFilters(filters);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Departure time from must be before departure time to.');
    });

    it('should accept new sort fields', () => {
      const filters = {
        sortBy: 'driver_rating'
      };

      const result = validateTripSearchFilters(filters);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept available_seats sort field', () => {
      const filters = {
        sortBy: 'available_seats'
      };

      const result = validateTripSearchFilters(filters);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});