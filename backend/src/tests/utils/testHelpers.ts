import request from 'supertest';
import app from '../../index';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt';
import { pool } from '../../config/database';
import { CreateTripRequest } from '../../models/Trip';

export interface TestUser {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  accessToken: string;
  refreshToken: string;
}

/**
 * Create a test user and return user ID
 */
export async function createTestUser(userData?: Partial<{
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  verificationStatus?: any;
}>): Promise<string> {
  const defaultUserData = {
    email: `test-${Date.now()}@example.com`,
    phone: `+59398765${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    password: 'TestPassword123!',
    firstName: 'Juan',
    lastName: 'Pérez',
    ...userData
  };

  // Register user
  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send(defaultUserData);

  if (registerResponse.status !== 201) {
    throw new Error(`Failed to create test user: ${registerResponse.body.error}`);
  }

  const userId = registerResponse.body.data.user.id;

  // Update verification status if provided
  if (userData?.verificationStatus) {
    await pool.query(
      'UPDATE users SET verification_status = $1 WHERE id = $2',
      [JSON.stringify(userData.verificationStatus), userId]
    );
  }

  return userId;
}

/**
 * Create a test user and return full user data with tokens
 */
export async function createTestUserWithTokens(userData?: Partial<{
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}>): Promise<TestUser> {
  const defaultUserData = {
    email: `test-${Date.now()}@example.com`,
    phone: `+59398765${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    password: 'TestPassword123!',
    firstName: 'Juan',
    lastName: 'Pérez',
    ...userData
  };

  // Register user
  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send(defaultUserData);

  if (registerResponse.status !== 201) {
    throw new Error(`Failed to create test user: ${registerResponse.body.error}`);
  }

  const user = registerResponse.body.data.user;
  const tokens = registerResponse.body.data.tokens;

  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  };
}

/**
 * Create a test trip and return trip ID
 */
export async function createTestTrip(driverId: string, tripData: CreateTripRequest): Promise<string> {
  const query = `
    INSERT INTO trips (
      driver_id, origin_city, destination_city, departure_date, departure_time,
      estimated_arrival_time, available_seats, total_seats, price_per_seat,
      vehicle_info, description
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8, $9, $10)
    RETURNING id
  `;

  const values = [
    driverId,
    tripData.originCity,
    tripData.destinationCity,
    tripData.departureDate,
    tripData.departureTime,
    tripData.estimatedArrivalTime,
    tripData.availableSeats,
    tripData.pricePerSeat,
    JSON.stringify(tripData.vehicleInfo),
    tripData.description
  ];

  const result = await pool.query(query, values);
  return result.rows[0].id;
}

/**
 * Get auth token for a user
 */
export async function getAuthToken(userId: string): Promise<string> {
  const query = 'SELECT email FROM users WHERE id = $1';
  const result = await pool.query(query, [userId]);
  
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  return generateAccessToken(userId, result.rows[0].email);
}

/**
 * Generate test JWT tokens for a user ID
 */
export function generateTestTokens(userId: string, email: string): {
  accessToken: string;
  refreshToken: string;
} {
  return {
    accessToken: generateAccessToken(userId, email),
    refreshToken: generateRefreshToken(userId, email)
  };
}

/**
 * Create authorization header for requests
 */
export function createAuthHeader(token: string): { Authorization: string } {
  return {
    Authorization: `Bearer ${token}`
  };
}

/**
 * Clean up test data from database
 */
export async function cleanupTestData(): Promise<void> {
  try {
    // Clean up in order due to foreign key constraints
    await pool.query('DELETE FROM bookings WHERE passenger_id IN (SELECT id FROM users WHERE email LIKE $1)', ['test-%@%']);
    await pool.query('DELETE FROM trips WHERE driver_id IN (SELECT id FROM users WHERE email LIKE $1)', ['test-%@%']);
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['test-%@%']);
    console.log('Test data cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
}

/**
 * Wait for a specified amount of time (useful for testing time-based features)
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a random Ecuador phone number for testing
 */
export function generateTestPhoneNumber(): string {
  const mobilePrefix = '98'; // Ecuador mobile prefix
  const randomSuffix = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return `+593${mobilePrefix}${randomSuffix}`;
}

/**
 * Generate a random email for testing
 */
export function generateTestEmail(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `test-${timestamp}-${random}@example.com`;
}

/**
 * Assert that response contains expected error structure
 */
export function expectErrorResponse(response: any, expectedCode?: string): void {
  expect(response.body.success).toBe(false);
  expect(response.body.error).toBeDefined();
  
  if (expectedCode) {
    expect(response.body.code).toBe(expectedCode);
  }
}

/**
 * Assert that response contains expected success structure
 */
export function expectSuccessResponse(response: any): void {
  expect(response.body.success).toBe(true);
  expect(response.body.data).toBeDefined();
}