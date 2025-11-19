export interface Trip {
  id: string;
  driverId: string;
  originCity: string;
  destinationCity: string;
  departureDate: Date;
  departureTime: string;
  estimatedArrivalTime: string;
  availableSeats: number;
  totalSeats: number;
  pricePerSeat: number;
  vehicleInfo: VehicleInfo;
  description?: string;
  status: TripStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  vehicleType: 'sedan' | 'suv' | 'hatchback' | 'pickup' | 'van' | 'other';
}

export type TripStatus = 'active' | 'full' | 'completed' | 'cancelled';

export interface CreateTripRequest {
  originCity: string;
  destinationCity: string;
  departureDate: string; // ISO date string
  departureTime: string; // HH:MM format
  estimatedArrivalTime: string; // HH:MM format
  availableSeats: number;
  pricePerSeat: number;
  vehicleInfo: VehicleInfo;
  description?: string;
}

export interface UpdateTripRequest {
  departureDate?: string;
  departureTime?: string;
  estimatedArrivalTime?: string;
  availableSeats?: number;
  pricePerSeat?: number;
  description?: string;
  status?: TripStatus;
}

export interface TripSearchFilters {
  originCity?: string;
  destinationCity?: string;
  departureDate?: string;
  minPrice?: number;
  maxPrice?: number;
  minSeats?: number;
  minDriverRating?: number;
  verifiedDriversOnly?: boolean;
  departureTimeFrom?: string; // HH:MM format
  departureTimeTo?: string; // HH:MM format
  sortBy?: 'price' | 'departure_time' | 'created_at' | 'driver_rating' | 'available_seats';
  sortOrder?: 'asc' | 'desc';
}

export interface TripWithDriver {
  trip: Trip;
  driver: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
    rating: number;
    totalTrips: number;
    verificationStatus: {
      phoneVerified: boolean;
      identityVerified: boolean;
      backgroundCheckPassed: boolean;
      driverLicenseVerified: boolean;
      vehicleRegistrationVerified: boolean;
    };
  };
  bookedSeats: number;
}

// Ecuador cities for validation
export const ECUADOR_CITIES = [
  'Quito',
  'Guayaquil',
  'Cuenca',
  'Santo Domingo',
  'Machala',
  'Durán',
  'Manta',
  'Portoviejo',
  'Loja',
  'Ambato',
  'Esmeraldas',
  'Quevedo',
  'Riobamba',
  'Milagro',
  'Ibarra',
  'La Libertad',
  'Babahoyo',
  'Sangolquí',
  'Otavalo',
  'Rosa Zárate',
  'Pasaje',
  'Cayambe',
  'Latacunga',
  'Chone',
  'Tulcán',
  'Tena',
  'Puyo',
  'Macas',
  'Nueva Loja',
  'Zamora'
] as const;

export type EcuadorCity = typeof ECUADOR_CITIES[number];