// Shared TypeScript interfaces and types for Ecuador Rideshare App

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  dateOfBirth?: Date;
  rating: number;
  totalTrips: number;
  verificationStatus: VerificationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationStatus {
  phoneVerified: boolean;
  identityVerified: boolean;
  backgroundCheckPassed: boolean;
  backgroundCheckDate?: Date;
  driverLicenseVerified?: boolean;
  vehicleRegistrationVerified?: boolean;
}

export interface Trip {
  id: string;
  driverId: string;
  driver?: User;
  departureCity: string;
  destinationCity: string;
  departureDateTime: Date;
  estimatedArrivalDateTime: Date;
  availableSeats: number;
  pricePerSeat: number;
  status: TripStatus;
  vehicleInfo: VehicleInfo;
  route?: RoutePoint[];
  bookings?: Booking[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  capacity: number;
}

export interface RoutePoint {
  city: string;
  estimatedTime: Date;
  isStop: boolean;
}

export interface Booking {
  id: string;
  tripId: string;
  trip?: Trip;
  passengerId: string;
  passenger?: User;
  seatsBooked: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  bookingDate: Date;
  cancellationReason?: string;
  cancellationDate?: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: User;
  content: string;
  messageType: MessageType;
  timestamp: Date;
  encrypted: boolean;
  readStatus: ReadStatus;
  attachments?: MessageAttachment[];
}

export interface Conversation {
  id: string;
  tripId: string;
  trip?: Trip;
  participants: string[];
  participantUsers?: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

export interface VerificationDocument {
  id: string;
  userId: string;
  documentType: DocumentType;
  documentUrl: string;
  verificationStatus: DocumentVerificationStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewNotes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export interface Review {
  id: string;
  tripId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

// Enums
export enum TripStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  IN_PROGRESS = 'in_progress',
}

export enum BookingStatus {
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  PENDING = 'pending',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
}

export enum PaymentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
}

export enum ReadStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

export enum DocumentType {
  IDENTITY_CARD = 'identity_card',
  PASSPORT = 'passport',
  DRIVER_LICENSE = 'driver_license',
  VEHICLE_REGISTRATION = 'vehicle_registration',
  BACKGROUND_CHECK = 'background_check',
}

export enum DocumentVerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum NotificationType {
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_CANCELLED = 'booking_cancelled',
  TRIP_REMINDER = 'trip_reminder',
  MESSAGE_RECEIVED = 'message_received',
  VERIFICATION_UPDATE = 'verification_update',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    field?: string;
    details?: string;
  };
  timestamp: string;
  path?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Search and filter types
export interface TripSearchParams {
  departureCity: string;
  destinationCity: string;
  departureDate: string;
  passengers?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: 'price' | 'departure_time' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface TripFilters {
  priceRange: [number, number];
  timeRange: [string, string]; // HH:MM format
  minRating: number;
  verifiedDriversOnly: boolean;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}