import { CreateTripRequest, UpdateTripRequest, ECUADOR_CITIES, VehicleInfo } from '../models/Trip';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate trip creation data
 */
export function validateCreateTrip(tripData: CreateTripRequest): ValidationResult {
  const errors: string[] = [];

  // Validate cities
  if (!ECUADOR_CITIES.includes(tripData.originCity as any)) {
    errors.push('Invalid origin city. Must be a valid Ecuador city.');
  }

  if (!ECUADOR_CITIES.includes(tripData.destinationCity as any)) {
    errors.push('Invalid destination city. Must be a valid Ecuador city.');
  }

  if (tripData.originCity === tripData.destinationCity) {
    errors.push('Origin and destination cities must be different.');
  }

  // Validate departure date
  const departureDate = new Date(tripData.departureDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(departureDate.getTime())) {
    errors.push('Invalid departure date format.');
  } else if (departureDate < today) {
    errors.push('Departure date cannot be in the past.');
  }

  // Validate times
  if (!isValidTimeFormat(tripData.departureTime)) {
    errors.push('Invalid departure time format. Use HH:MM format.');
  }

  if (!isValidTimeFormat(tripData.estimatedArrivalTime)) {
    errors.push('Invalid arrival time format. Use HH:MM format.');
  }

  if (isValidTimeFormat(tripData.departureTime) && isValidTimeFormat(tripData.estimatedArrivalTime)) {
    if (timeToMinutes(tripData.departureTime) >= timeToMinutes(tripData.estimatedArrivalTime)) {
      errors.push('Departure time must be before arrival time.');
    }
  }

  // Validate seats
  if (!Number.isInteger(tripData.availableSeats) || tripData.availableSeats < 1 || tripData.availableSeats > 8) {
    errors.push('Available seats must be between 1 and 8.');
  }

  // Validate price
  if (typeof tripData.pricePerSeat !== 'number' || tripData.pricePerSeat <= 0 || tripData.pricePerSeat > 1000) {
    errors.push('Price per seat must be between $0.01 and $1000.');
  }

  // Validate vehicle info
  const vehicleValidation = validateVehicleInfo(tripData.vehicleInfo);
  if (!vehicleValidation.isValid) {
    errors.push(...vehicleValidation.errors);
  }

  // Validate description length
  if (tripData.description && tripData.description.length > 500) {
    errors.push('Description cannot exceed 500 characters.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate trip update data
 */
export function validateUpdateTrip(updateData: UpdateTripRequest): ValidationResult {
  const errors: string[] = [];

  // Validate departure date if provided
  if (updateData.departureDate) {
    const departureDate = new Date(updateData.departureDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(departureDate.getTime())) {
      errors.push('Invalid departure date format.');
    } else if (departureDate < today) {
      errors.push('Departure date cannot be in the past.');
    }
  }

  // Validate times if provided
  if (updateData.departureTime && !isValidTimeFormat(updateData.departureTime)) {
    errors.push('Invalid departure time format. Use HH:MM format.');
  }

  if (updateData.estimatedArrivalTime && !isValidTimeFormat(updateData.estimatedArrivalTime)) {
    errors.push('Invalid arrival time format. Use HH:MM format.');
  }

  // Validate time relationship if both are provided
  if (updateData.departureTime && updateData.estimatedArrivalTime) {
    if (timeToMinutes(updateData.departureTime) >= timeToMinutes(updateData.estimatedArrivalTime)) {
      errors.push('Departure time must be before arrival time.');
    }
  }

  // Validate seats if provided
  if (updateData.availableSeats !== undefined) {
    if (!Number.isInteger(updateData.availableSeats) || updateData.availableSeats < 0 || updateData.availableSeats > 8) {
      errors.push('Available seats must be between 0 and 8.');
    }
  }

  // Validate price if provided
  if (updateData.pricePerSeat !== undefined) {
    if (typeof updateData.pricePerSeat !== 'number' || updateData.pricePerSeat <= 0 || updateData.pricePerSeat > 1000) {
      errors.push('Price per seat must be between $0.01 and $1000.');
    }
  }

  // Validate status if provided
  if (updateData.status && !['active', 'full', 'completed', 'cancelled'].includes(updateData.status)) {
    errors.push('Invalid trip status.');
  }

  // Validate description length if provided
  if (updateData.description && updateData.description.length > 500) {
    errors.push('Description cannot exceed 500 characters.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate vehicle information
 */
export function validateVehicleInfo(vehicleInfo: VehicleInfo): ValidationResult {
  const errors: string[] = [];

  if (!vehicleInfo.make || vehicleInfo.make.trim().length === 0) {
    errors.push('Vehicle make is required.');
  } else if (vehicleInfo.make.length > 50) {
    errors.push('Vehicle make cannot exceed 50 characters.');
  }

  if (!vehicleInfo.model || vehicleInfo.model.trim().length === 0) {
    errors.push('Vehicle model is required.');
  } else if (vehicleInfo.model.length > 50) {
    errors.push('Vehicle model cannot exceed 50 characters.');
  }

  const currentYear = new Date().getFullYear();
  if (!Number.isInteger(vehicleInfo.year) || vehicleInfo.year < 1990 || vehicleInfo.year > currentYear + 1) {
    errors.push(`Vehicle year must be between 1990 and ${currentYear + 1}.`);
  }

  if (!vehicleInfo.color || vehicleInfo.color.trim().length === 0) {
    errors.push('Vehicle color is required.');
  } else if (vehicleInfo.color.length > 30) {
    errors.push('Vehicle color cannot exceed 30 characters.');
  }

  if (!vehicleInfo.licensePlate || vehicleInfo.licensePlate.trim().length === 0) {
    errors.push('License plate is required.');
  } else if (!isValidEcuadorLicensePlate(vehicleInfo.licensePlate)) {
    errors.push('Invalid Ecuador license plate format. Use format: ABC-1234 or AB-1234.');
  }

  const validVehicleTypes = ['sedan', 'suv', 'hatchback', 'pickup', 'van', 'other'];
  if (!validVehicleTypes.includes(vehicleInfo.vehicleType)) {
    errors.push('Invalid vehicle type.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate Ecuador license plate format
 */
export function isValidEcuadorLicensePlate(licensePlate: string): boolean {
  // Ecuador license plate formats:
  // ABC-1234 (3 letters, dash, 4 numbers)
  // AB-1234 (2 letters, dash, 4 numbers) - older format
  const ecuadorPlateRegex = /^[A-Z]{2,3}-\d{4}$/;
  return ecuadorPlateRegex.test(licensePlate.toUpperCase());
}

/**
 * Validate time format (HH:MM)
 */
function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Convert time string to minutes for comparison
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Validate trip search filters
 */
export function validateTripSearchFilters(filters: any): ValidationResult {
  const errors: string[] = [];

  if (filters.originCity && !ECUADOR_CITIES.includes(filters.originCity)) {
    errors.push('Invalid origin city.');
  }

  if (filters.destinationCity && !ECUADOR_CITIES.includes(filters.destinationCity)) {
    errors.push('Invalid destination city.');
  }

  if (filters.departureDate) {
    const date = new Date(filters.departureDate);
    if (isNaN(date.getTime())) {
      errors.push('Invalid departure date format.');
    }
  }

  if (filters.minPrice !== undefined) {
    if (typeof filters.minPrice !== 'number' || filters.minPrice < 0) {
      errors.push('Minimum price must be a positive number.');
    }
  }

  if (filters.maxPrice !== undefined) {
    if (typeof filters.maxPrice !== 'number' || filters.maxPrice < 0) {
      errors.push('Maximum price must be a positive number.');
    }
  }

  if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
    if (filters.minPrice > filters.maxPrice) {
      errors.push('Minimum price cannot be greater than maximum price.');
    }
  }

  if (filters.minSeats !== undefined) {
    if (!Number.isInteger(filters.minSeats) || filters.minSeats < 1 || filters.minSeats > 8) {
      errors.push('Minimum seats must be between 1 and 8.');
    }
  }

  if (filters.sortBy && !['price', 'departure_time', 'created_at', 'driver_rating', 'available_seats'].includes(filters.sortBy)) {
    errors.push('Invalid sort field.');
  }

  if (filters.sortOrder && !['asc', 'desc'].includes(filters.sortOrder)) {
    errors.push('Invalid sort order. Use "asc" or "desc".');
  }

  if (filters.minDriverRating !== undefined) {
    if (typeof filters.minDriverRating !== 'number' || filters.minDriverRating < 0 || filters.minDriverRating > 5) {
      errors.push('Minimum driver rating must be between 0 and 5.');
    }
  }

  if (filters.departureTimeFrom && !isValidTimeFormat(filters.departureTimeFrom)) {
    errors.push('Invalid departure time from format. Use HH:MM format.');
  }

  if (filters.departureTimeTo && !isValidTimeFormat(filters.departureTimeTo)) {
    errors.push('Invalid departure time to format. Use HH:MM format.');
  }

  if (filters.departureTimeFrom && filters.departureTimeTo) {
    if (timeToMinutes(filters.departureTimeFrom) >= timeToMinutes(filters.departureTimeTo)) {
      errors.push('Departure time from must be before departure time to.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}