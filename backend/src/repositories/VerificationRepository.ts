import { Pool } from 'pg';

export interface VerificationEvent {
  id: string;
  userId: string;
  verificationType: string;
  status: string;
  details?: any;
  createdAt: Date;
}

export interface IdentityVerification {
  id: string;
  userId: string;
  documentType: 'cedula' | 'passport';
  documentNumber: string;
  documentPhoto: string;
  fullName: string;
  dateOfBirth: Date;
  status: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationDetails {
  phoneVerification?: {
    verified: boolean;
    verifiedAt?: Date;
  };
  identityVerification?: {
    status: 'pending' | 'approved' | 'rejected' | 'not_submitted';
    submittedAt?: Date;
    reviewedAt?: Date;
    documentType?: string;
    reviewNotes?: string;
  };
  backgroundCheck?: {
    status: 'pending' | 'approved' | 'rejected' | 'expired' | 'not_submitted';
    submittedAt?: Date;
    approvedAt?: Date;
    expiryDate?: Date;
    daysUntilExpiry?: number;
  };
  driverLicense?: {
    verified: boolean;
    verifiedAt?: Date;
  };
  vehicleRegistration?: {
    verified: boolean;
    verifiedAt?: Date;
  };
}

export class VerificationRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Get detailed verification information for a user
   * @param userId - User ID
   * @returns Detailed verification status
   */
  async getVerificationDetails(userId: string): Promise<VerificationDetails> {
    const details: VerificationDetails = {};

    // Get phone verification details
    const phoneQuery = `
      SELECT created_at 
      FROM verification_events 
      WHERE user_id = $1 AND verification_type = 'phone' AND status = 'verified'
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const phoneResult = await this.pool.query(phoneQuery, [userId]);
    
    details.phoneVerification = {
      verified: phoneResult.rows.length > 0,
      verifiedAt: phoneResult.rows[0]?.created_at
    };

    // Get identity verification details
    const identityQuery = `
      SELECT status, document_type, created_at, reviewed_at, review_notes
      FROM identity_verifications 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const identityResult = await this.pool.query(identityQuery, [userId]);
    
    if (identityResult.rows.length > 0) {
      const identity = identityResult.rows[0];
      details.identityVerification = {
        status: identity.status,
        submittedAt: identity.created_at,
        reviewedAt: identity.reviewed_at,
        documentType: identity.document_type,
        reviewNotes: identity.review_notes
      };
    } else {
      details.identityVerification = {
        status: 'not_submitted'
      };
    }

    // Get background check details
    const backgroundQuery = `
      SELECT status, created_at, approved_at, expiry_date
      FROM background_checks 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const backgroundResult = await this.pool.query(backgroundQuery, [userId]);
    
    if (backgroundResult.rows.length > 0) {
      const background = backgroundResult.rows[0];
      const expiryDate = background.expiry_date ? new Date(background.expiry_date) : undefined;
      const now = new Date();
      
      let status = background.status;
      let daysUntilExpiry: number | undefined = undefined;
      
      if (status === 'approved' && expiryDate) {
        if (now > expiryDate) {
          status = 'expired';
        } else {
          daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        }
      }

      details.backgroundCheck = {
        status,
        submittedAt: background.created_at,
        approvedAt: background.approved_at,
        expiryDate,
        daysUntilExpiry
      };
    } else {
      details.backgroundCheck = {
        status: 'not_submitted'
      };
    }

    // Get driver license verification details
    const driverQuery = `
      SELECT created_at 
      FROM verification_events 
      WHERE user_id = $1 AND verification_type = 'driver_license' AND status = 'verified'
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const driverResult = await this.pool.query(driverQuery, [userId]);
    
    details.driverLicense = {
      verified: driverResult.rows.length > 0,
      verifiedAt: driverResult.rows[0]?.created_at
    };

    // Get vehicle registration verification details
    const vehicleQuery = `
      SELECT created_at 
      FROM verification_events 
      WHERE user_id = $1 AND verification_type = 'vehicle_registration' AND status = 'verified'
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const vehicleResult = await this.pool.query(vehicleQuery, [userId]);
    
    details.vehicleRegistration = {
      verified: vehicleResult.rows.length > 0,
      verifiedAt: vehicleResult.rows[0]?.created_at
    };

    return details;
  }

  /**
   * Log a verification event
   * @param userId - User ID
   * @param verificationType - Type of verification
   * @param status - Verification status
   * @param details - Additional details
   */
  async logVerificationEvent(
    userId: string, 
    verificationType: string, 
    status: string, 
    details?: any
  ): Promise<VerificationEvent> {
    const query = `
      INSERT INTO verification_events (user_id, verification_type, status, details)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, verification_type, status, details, created_at
    `;

    const values = [userId, verificationType, status, details ? JSON.stringify(details) : null];
    const result = await this.pool.query(query, values);

    return {
      id: result.rows[0].id,
      userId: result.rows[0].user_id,
      verificationType: result.rows[0].verification_type,
      status: result.rows[0].status,
      details: result.rows[0].details,
      createdAt: result.rows[0].created_at
    };
  }

  /**
   * Submit identity verification
   * @param data - Identity verification data
   */
  async submitIdentityVerification(data: {
    userId: string;
    documentType: 'cedula' | 'passport';
    documentNumber: string;
    documentPhoto: string;
    fullName: string;
    dateOfBirth: Date;
  }): Promise<IdentityVerification> {
    const query = `
      INSERT INTO identity_verifications (
        user_id, document_type, document_number, document_photo, 
        full_name, date_of_birth, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING 
        id, user_id, document_type, document_number, document_photo,
        full_name, date_of_birth, status, created_at, updated_at
    `;

    const values = [
      data.userId,
      data.documentType,
      data.documentNumber,
      data.documentPhoto,
      data.fullName,
      data.dateOfBirth
    ];

    const result = await this.pool.query(query, values);
    
    // Log the event
    await this.logVerificationEvent(data.userId, 'identity', 'submitted', {
      documentType: data.documentType
    });

    return this.mapRowToIdentityVerification(result.rows[0]);
  }

  /**
   * Get latest identity verification for user
   * @param userId - User ID
   */
  async getLatestIdentityVerification(userId: string): Promise<IdentityVerification | null> {
    const query = `
      SELECT 
        id, user_id, document_type, document_number, document_photo,
        full_name, date_of_birth, status, review_notes, reviewed_by,
        reviewed_at, created_at, updated_at
      FROM identity_verifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await this.pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToIdentityVerification(result.rows[0]);
  }

  /**
   * Get verification history for user
   * @param userId - User ID
   * @param page - Page number
   * @param limit - Items per page
   */
  async getVerificationHistory(userId: string, page: number = 1, limit: number = 20): Promise<{
    events: VerificationEvent[];
    total: number;
  }> {
    const offset = (page - 1) * limit;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM verification_events
      WHERE user_id = $1
    `;
    const countResult = await this.pool.query(countQuery, [userId]);
    const total = parseInt(countResult.rows[0].total);

    // Get events
    const eventsQuery = `
      SELECT id, user_id, verification_type, status, details, created_at
      FROM verification_events
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const eventsResult = await this.pool.query(eventsQuery, [userId, limit, offset]);

    const events = eventsResult.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      verificationType: row.verification_type,
      status: row.status,
      details: row.details,
      createdAt: row.created_at
    }));

    return { events, total };
  }

  /**
   * Get users with expiring background checks
   * @param daysBeforeExpiry - Number of days before expiry to check
   */
  async getUsersWithExpiringBackgroundChecks(daysBeforeExpiry: number = 7): Promise<Array<{
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    expiryDate: Date;
    daysUntilExpiry: number;
  }>> {
    const query = `
      SELECT 
        u.id as user_id, u.email, u.first_name, u.last_name,
        bc.expiry_date
      FROM users u
      JOIN background_checks bc ON u.id = bc.user_id
      WHERE bc.status = 'approved'
        AND bc.expiry_date IS NOT NULL
        AND bc.expiry_date > CURRENT_TIMESTAMP
        AND bc.expiry_date <= CURRENT_TIMESTAMP + INTERVAL '${daysBeforeExpiry} days'
      ORDER BY bc.expiry_date ASC
    `;

    const result = await this.pool.query(query);
    
    return result.rows.map(row => {
      const expiryDate = new Date(row.expiry_date);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        userId: row.user_id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        expiryDate,
        daysUntilExpiry
      };
    });
  }

  /**
   * Get users with expired background checks
   */
  async getUsersWithExpiredBackgroundChecks(): Promise<Array<{
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    expiryDate: Date;
    daysExpired: number;
  }>> {
    const query = `
      SELECT 
        u.id as user_id, u.email, u.first_name, u.last_name,
        bc.expiry_date
      FROM users u
      JOIN background_checks bc ON u.id = bc.user_id
      WHERE bc.status = 'approved'
        AND bc.expiry_date IS NOT NULL
        AND bc.expiry_date < CURRENT_TIMESTAMP
      ORDER BY bc.expiry_date DESC
    `;

    const result = await this.pool.query(query);
    
    return result.rows.map(row => {
      const expiryDate = new Date(row.expiry_date);
      const now = new Date();
      const daysExpired = Math.ceil((now.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24));

      return {
        userId: row.user_id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        expiryDate,
        daysExpired
      };
    });
  }

  // Admin workflow methods

  async getVerificationQueue(options: {
    page: number;
    limit: number;
    type?: string;
  }): Promise<{
    requests: any[];
    total: number;
    stats: { pending: number; processing: number; total: number };
  }> {
    try {
      const offset = (options.page - 1) * options.limit;
      let typeFilter = '';
      let params: any[] = [options.limit, offset];

      if (options.type) {
        typeFilter = 'AND iv.document_type = $3';
        params.push(options.type);
      }

      // Get identity verification requests (main verification type)
      const requestsQuery = `
        SELECT 
          iv.*,
          u.email, u.first_name, u.last_name, u.phone_number,
          u.created_at as user_created_at
        FROM identity_verifications iv
        JOIN users u ON iv.user_id = u.id
        WHERE iv.status = 'pending'
        ${typeFilter}
        ORDER BY iv.created_at ASC
        LIMIT $1 OFFSET $2
      `;

      const requests = await this.pool.query(requestsQuery, params);

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM identity_verifications iv
        WHERE iv.status = 'pending'
        ${typeFilter}
      `;
      const countParams = options.type ? [options.type] : [];
      const countResult = await this.pool.query(countQuery, countParams);

      // Get stats
      const statsResult = await this.pool.query(`
        SELECT 
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          0 as processing,
          COUNT(*) as total
        FROM identity_verifications
        WHERE status = 'pending'
      `);

      return {
        requests: requests.rows,
        total: parseInt(countResult.rows[0].total),
        stats: {
          pending: parseInt(statsResult.rows[0].pending),
          processing: parseInt(statsResult.rows[0].processing),
          total: parseInt(statsResult.rows[0].total)
        }
      };
    } catch (error) {
      console.error('Error getting verification queue:', error);
      throw error;
    }
  }

  async getVerificationRequestDetails(requestId: number): Promise<any> {
    try {
      const result = await this.pool.query(`
        SELECT 
          iv.*,
          u.email, u.first_name, u.last_name, u.phone_number,
          u.created_at as user_created_at,
          admin_u.first_name as admin_first_name,
          admin_u.last_name as admin_last_name
        FROM identity_verifications iv
        JOIN users u ON iv.user_id = u.id
        LEFT JOIN users admin_u ON iv.reviewed_by = admin_u.id
        WHERE iv.id = $1
      `, [requestId]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting verification request details:', error);
      throw error;
    }
  }

  async approveVerificationRequest(requestId: number, adminId: string, adminNotes?: string): Promise<boolean> {
    try {
      const result = await this.pool.query(`
        UPDATE identity_verifications 
        SET 
          status = 'approved',
          reviewed_by = $2,
          reviewed_at = NOW(),
          review_notes = $3,
          updated_at = NOW()
        WHERE id = $1 AND status = 'pending'
        RETURNING id, user_id
      `, [requestId, adminId, adminNotes]);

      if (result.rows.length > 0) {
        // Log the approval event
        await this.logVerificationEvent(result.rows[0].user_id, 'identity', 'approved', {
          adminId,
          adminNotes
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error approving verification request:', error);
      throw error;
    }
  }

  async rejectVerificationRequest(requestId: number, adminId: string, adminNotes: string, reason?: string): Promise<boolean> {
    try {
      const result = await this.pool.query(`
        UPDATE identity_verifications 
        SET 
          status = 'rejected',
          reviewed_by = $2,
          reviewed_at = NOW(),
          review_notes = $3,
          updated_at = NOW()
        WHERE id = $1 AND status = 'pending'
        RETURNING id, user_id
      `, [requestId, adminId, adminNotes]);

      if (result.rows.length > 0) {
        // Log the rejection event
        await this.logVerificationEvent(result.rows[0].user_id, 'identity', 'rejected', {
          adminId,
          adminNotes,
          reason
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error rejecting verification request:', error);
      throw error;
    }
  }

  async getAdminVerificationStats(timeframe: string): Promise<any> {
    try {
      let dateFilter = '';
      switch (timeframe) {
        case '7d':
          dateFilter = "AND created_at >= NOW() - INTERVAL '7 days'";
          break;
        case '30d':
          dateFilter = "AND created_at >= NOW() - INTERVAL '30 days'";
          break;
        case '90d':
          dateFilter = "AND created_at >= NOW() - INTERVAL '90 days'";
          break;
        case '1y':
          dateFilter = "AND created_at >= NOW() - INTERVAL '1 year'";
          break;
      }

      const result = await this.pool.query(`
        SELECT 
          COUNT(*) as total_requests,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          0 as processing,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
          AVG(EXTRACT(EPOCH FROM (reviewed_at - created_at))/3600) as avg_processing_hours
        FROM identity_verifications
        WHERE 1=1 ${dateFilter}
      `);

      return result.rows[0];
    } catch (error) {
      console.error('Error getting admin verification stats:', error);
      throw error;
    }
  }

  async bulkApproveRequests(requestIds: number[], adminId: string, adminNotes?: string): Promise<{
    approved: number;
    failed: number;
    errors: string[];
  }> {
    try {
      let approved = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const requestId of requestIds) {
        try {
          const success = await this.approveVerificationRequest(requestId, adminId, adminNotes);
          if (success) {
            approved++;
          } else {
            failed++;
            errors.push(`Request ${requestId}: Not found or already processed`);
          }
        } catch (error: any) {
          failed++;
          errors.push(`Request ${requestId}: ${error.message}`);
        }
      }

      return { approved, failed, errors };
    } catch (error) {
      console.error('Error bulk approving requests:', error);
      throw error;
    }
  }

  async getAdminActivity(options: {
    page: number;
    limit: number;
    adminId?: number;
  }): Promise<{
    activities: any[];
    total: number;
  }> {
    try {
      const offset = (options.page - 1) * options.limit;
      let adminFilter = '';
      let params: any[] = [options.limit, offset];

      if (options.adminId) {
        adminFilter = 'AND iv.reviewed_by = $3';
        params.push(options.adminId);
      }

      const activitiesQuery = `
        SELECT 
          iv.id, iv.document_type, iv.status, iv.reviewed_at,
          iv.review_notes,
          u.first_name as user_first_name, u.last_name as user_last_name,
          admin_u.first_name as admin_first_name, admin_u.last_name as admin_last_name
        FROM identity_verifications iv
        JOIN users u ON iv.user_id = u.id
        LEFT JOIN users admin_u ON iv.reviewed_by = admin_u.id
        WHERE iv.status IN ('approved', 'rejected') AND iv.reviewed_at IS NOT NULL
        ${adminFilter}
        ORDER BY iv.reviewed_at DESC
        LIMIT $1 OFFSET $2
      `;

      const activities = await this.pool.query(activitiesQuery, params);

      const countQuery = `
        SELECT COUNT(*) as total
        FROM identity_verifications iv
        WHERE iv.status IN ('approved', 'rejected') AND iv.reviewed_at IS NOT NULL
        ${adminFilter}
      `;
      const countParams = options.adminId ? [options.adminId] : [];
      const countResult = await this.pool.query(countQuery, countParams);

      return {
        activities: activities.rows,
        total: parseInt(countResult.rows[0].total)
      };
    } catch (error) {
      console.error('Error getting admin activity:', error);
      throw error;
    }
  }

  /**
   * Map database row to IdentityVerification object
   */
  private mapRowToIdentityVerification(row: any): IdentityVerification {
    return {
      id: row.id,
      userId: row.user_id,
      documentType: row.document_type,
      documentNumber: row.document_number,
      documentPhoto: row.document_photo,
      fullName: row.full_name,
      dateOfBirth: row.date_of_birth,
      status: row.status,
      reviewNotes: row.review_notes,
      reviewedBy: row.reviewed_by,
      reviewedAt: row.reviewed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}