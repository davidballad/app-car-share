export interface Booking {
  id: string;
  tripId: string;
  passengerId: string;
  seatsBooked: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: BookingStatus;
  bookingDate: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentMethod = 'bank_transfer' | 'cash';
export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';

export interface CreateBookingRequest {
  tripId: string;
  seatsBooked: number;
  paymentMethod: PaymentMethod;
}

export interface UpdateBookingRequest {
  status?: BookingStatus;
  cancellationReason?: string;
}

export interface BookingWithDetails {
  booking: Booking;
  trip: {
    id: string;
    originCity: string;
    destinationCity: string;
    departureDate: Date;
    departureTime: string;
    pricePerSeat: number;
    driverId: string;
  };
  passenger: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
    rating: number;
  };
  driver: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
    rating: number;
  };
}

export interface BookingValidationResult {
  isValid: boolean;
  errors: string[];
}