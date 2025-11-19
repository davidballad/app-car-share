import { Pool } from 'pg';
import { User, CreateUserRequest, UserProfile, VerificationStatus } from '../models/User';

export class UserRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Create a new user
   * @param userData - User data to create
   * @returns Created user
   */
  async createUser(userData: CreateUserRequest & { passwordHash: string }): Promise<User> {
    const query = `
      INSERT INTO users (
        email, phone, password_hash, first_name, last_name, date_of_birth
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING 
        id, email, phone, password_hash, first_name, last_name, 
        profile_photo_url, date_of_birth, rating, total_trips, 
        verification_status, created_at, updated_at
    `;

    const values = [
      userData.email,
      userData.phone,
      userData.passwordHash,
      userData.firstName,
      userData.lastName,
      userData.dateOfBirth || null
    ];

    const result = await this.pool.query(query, values);
    return this.mapRowToUser(result.rows[0]);
  }

  /**
   * Find user by email
   * @param email - User email
   * @returns User or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT 
        id, email, phone, password_hash, first_name, last_name, 
        profile_photo_url, date_of_birth, rating, total_trips, 
        verification_status, created_at, updated_at
      FROM users 
      WHERE email = $1
    `;

    const result = await this.pool.query(query, [email]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  /**
   * Find user by phone
   * @param phone - User phone number
   * @returns User or null if not found
   */
  async findByPhone(phone: string): Promise<User | null> {
    const query = `
      SELECT 
        id, email, phone, password_hash, first_name, last_name, 
        profile_photo_url, date_of_birth, rating, total_trips, 
        verification_status, created_at, updated_at
      FROM users 
      WHERE phone = $1
    `;

    const result = await this.pool.query(query, [phone]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  /**
   * Find user by ID
   * @param id - User ID
   * @returns User or null if not found
   */
  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT 
        id, email, phone, password_hash, first_name, last_name, 
        profile_photo_url, date_of_birth, rating, total_trips, 
        verification_status, created_at, updated_at
      FROM users 
      WHERE id = $1
    `;

    const result = await this.pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  /**
   * Update user verification status
   * @param userId - User ID
   * @param verificationStatus - New verification status
   */
  async updateVerificationStatus(userId: string, verificationStatus: Partial<VerificationStatus>): Promise<void> {
    const query = `
      UPDATE users 
      SET verification_status = verification_status || $2::jsonb,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    await this.pool.query(query, [userId, JSON.stringify(verificationStatus)]);
  }

  /**
   * Get user profile (without sensitive data)
   * @param userId - User ID
   * @returns User profile or null if not found
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const query = `
      SELECT 
        id, email, phone, first_name, last_name, 
        profile_photo_url, rating, total_trips, 
        verification_status, created_at
      FROM users 
      WHERE id = $1
    `;

    const result = await this.pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      phone: row.phone,
      firstName: row.first_name,
      lastName: row.last_name,
      profilePhoto: row.profile_photo_url,
      rating: parseFloat(row.rating),
      totalTrips: row.total_trips,
      verificationStatus: row.verification_status,
      createdAt: row.created_at
    };
  }

  /**
   * Check if email exists
   * @param email - Email to check
   * @returns True if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const query = 'SELECT 1 FROM users WHERE email = $1 LIMIT 1';
    const result = await this.pool.query(query, [email]);
    return result.rows.length > 0;
  }

  /**
   * Check if phone exists
   * @param phone - Phone to check
   * @returns True if phone exists
   */
  async phoneExists(phone: string): Promise<boolean> {
    const query = 'SELECT 1 FROM users WHERE phone = $1 LIMIT 1';
    const result = await this.pool.query(query, [phone]);
    return result.rows.length > 0;
  }

  /**
   * Update user profile
   * @param userId - User ID
   * @param profileData - Profile data to update
   */
  async updateProfile(userId: string, profileData: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: Date;
    profilePhoto?: string;
  }): Promise<void> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (profileData.firstName !== undefined) {
      updateFields.push(`first_name = $${paramIndex++}`);
      values.push(profileData.firstName);
    }

    if (profileData.lastName !== undefined) {
      updateFields.push(`last_name = $${paramIndex++}`);
      values.push(profileData.lastName);
    }

    if (profileData.dateOfBirth !== undefined) {
      updateFields.push(`date_of_birth = $${paramIndex++}`);
      values.push(profileData.dateOfBirth);
    }

    if (profileData.profilePhoto !== undefined) {
      updateFields.push(`profile_photo_url = $${paramIndex++}`);
      values.push(profileData.profilePhoto);
    }

    if (updateFields.length === 0) {
      return; // Nothing to update
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
    `;

    await this.pool.query(query, values);
  }

  /**
   * Get public profile (limited information for other users)
   * @param userId - User ID
   * @returns Public profile or null if not found
   */
  async getPublicProfile(userId: string): Promise<{
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
    };
    createdAt: Date;
  } | null> {
    const query = `
      SELECT 
        id, first_name, last_name, profile_photo_url, 
        rating, total_trips, verification_status, created_at
      FROM users 
      WHERE id = $1 AND deleted_at IS NULL
    `;

    const result = await this.pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      profilePhoto: row.profile_photo_url,
      rating: parseFloat(row.rating),
      totalTrips: row.total_trips,
      verificationStatus: {
        phoneVerified: row.verification_status.phoneVerified || false,
        identityVerified: row.verification_status.identityVerified || false,
        backgroundCheckPassed: row.verification_status.backgroundCheckPassed || false,
        driverLicenseVerified: row.verification_status.driverLicenseVerified || false
      },
      createdAt: row.created_at
    };
  }

  /**
   * Soft delete user account
   * @param userId - User ID
   */
  async softDeleteUser(userId: string): Promise<void> {
    const query = `
      UPDATE users 
      SET deleted_at = CURRENT_TIMESTAMP,
          email = CONCAT(email, '_deleted_', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)),
          phone = CONCAT(phone, '_deleted_', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    await this.pool.query(query, [userId]);
  }

  /**
   * Update user rating
   * @param userId - User ID
   * @param newRating - New rating value
   * @param totalTrips - Updated total trips count
   */
  async updateRating(userId: string, newRating: number, totalTrips: number): Promise<void> {
    const query = `
      UPDATE users 
      SET rating = $2, 
          total_trips = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    await this.pool.query(query, [userId, newRating, totalTrips]);
  }

  /**
   * Get users by rating range (for recommendations)
   * @param minRating - Minimum rating
   * @param limit - Maximum number of results
   * @returns Array of user profiles
   */
  async getUsersByRating(minRating: number = 4.0, limit: number = 10): Promise<UserProfile[]> {
    const query = `
      SELECT 
        id, email, phone, first_name, last_name, 
        profile_photo_url, rating, total_trips, 
        verification_status, created_at
      FROM users 
      WHERE rating >= $1 
        AND total_trips > 0 
        AND deleted_at IS NULL
      ORDER BY rating DESC, total_trips DESC
      LIMIT $2
    `;

    const result = await this.pool.query(query, [minRating, limit]);
    
    return result.rows.map(row => ({
      id: row.id,
      email: row.email,
      phone: row.phone,
      firstName: row.first_name,
      lastName: row.last_name,
      profilePhoto: row.profile_photo_url,
      rating: parseFloat(row.rating),
      totalTrips: row.total_trips,
      verificationStatus: row.verification_status,
      createdAt: row.created_at
    }));
  }

  /**
   * Map database row to User object
   * @param row - Database row
   * @returns User object
   */
  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      phone: row.phone,
      passwordHash: row.password_hash,
      firstName: row.first_name,
      lastName: row.last_name,
      profilePhoto: row.profile_photo_url,
      dateOfBirth: row.date_of_birth,
      rating: parseFloat(row.rating),
      totalTrips: row.total_trips,
      verificationStatus: row.verification_status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}