export interface User {
  id: string;
  email: string;
  phone: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  dateOfBirth?: Date;
  rating: number;
  totalTrips: number;
  verificationStatus: VerificationStatus;
  role?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationStatus {
  phoneVerified: boolean;
  identityVerified: boolean;
  backgroundCheckPassed: boolean;
  backgroundCheckDate?: Date;
  backgroundCheckExpiryDate?: Date;
  ecuadorianCedula?: string;
  passportNumber?: string;
  driverLicenseVerified?: boolean;
  vehicleRegistrationVerified?: boolean;
}

export interface CreateUserRequest {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  rating: number;
  totalTrips: number;
  verificationStatus: VerificationStatus;
  role?: string;
  createdAt: Date;
}