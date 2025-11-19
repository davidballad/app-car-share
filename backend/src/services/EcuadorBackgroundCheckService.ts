import { Pool } from 'pg';
import { getPool } from '../config/database';

export interface CedulaValidationResult {
  isValid: boolean;
  error?: string;
  formattedCedula?: string;
}

export interface PassportValidationResult {
  isValid: boolean;
  error?: string;
  formattedPassport?: string;
}

export interface BackgroundCheckRequest {
  userId: string;
  documentType: 'cedula' | 'passport';
  documentNumber: string;
  fullName: string;
  birthDate: string;
  documentPhotoUrl?: string;
}

export interface BackgroundCheckStatus {
  id: number;
  userId: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  documentType: 'cedula' | 'passport';
  documentNumber: string;
  submittedAt: Date;
  reviewedAt?: Date;
  expiresAt?: Date;
  adminNotes?: string;
}

export class EcuadorBackgroundCheckService {
  private pool: Pool | null = null;

  constructor() {
    // Only initialize pool when needed for database operations
  }

  private getPool(): Pool {
    if (!this.pool) {
      this.pool = getPool();
    }
    return this.pool;
  }

  /**
   * Validates Ecuador cedula using the official check digit algorithm
   * Ecuador cedula format: 10 digits (PPCCCCCCCD)
   * PP = Province code (01-24)
   * CCCCCCC = Sequential number
   * D = Check digit
   */
  validateCedula(cedula: string): CedulaValidationResult {
    // Remove any non-numeric characters
    const cleanCedula = cedula.replace(/\D/g, '');

    // Check length
    if (cleanCedula.length !== 10) {
      return {
        isValid: false,
        error: 'Cedula must be exactly 10 digits'
      };
    }

    // Check province code (first 2 digits must be between 01-24)
    const provinceCode = parseInt(cleanCedula.substring(0, 2));
    if (provinceCode < 1 || provinceCode > 24) {
      return {
        isValid: false,
        error: 'Invalid province code. Must be between 01-24'
      };
    }

    // Check third digit (must be less than 6 for natural persons)
    const thirdDigit = parseInt(cleanCedula.charAt(2));
    if (thirdDigit >= 6) {
      return {
        isValid: false,
        error: 'Invalid cedula format for natural person'
      };
    }

    // Calculate check digit using Ecuador's algorithm
    const digits = cleanCedula.split('').map(d => parseInt(d));
    const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let sum = 0;

    for (let i = 0; i < 9; i++) {
      let product = digits[i] * coefficients[i];
      if (product >= 10) {
        product = Math.floor(product / 10) + (product % 10);
      }
      sum += product;
    }

    const calculatedCheckDigit = (10 - (sum % 10)) % 10;
    const providedCheckDigit = digits[9];

    if (calculatedCheckDigit !== providedCheckDigit) {
      return {
        isValid: false,
        error: 'Invalid check digit'
      };
    }

    return {
      isValid: true,
      formattedCedula: cleanCedula
    };
  }

  /**
   * Validates Ecuador passport format
   * Ecuador passport format: Alphanumeric, typically 9 characters
   */
  validatePassport(passport: string): PassportValidationResult {
    // Remove spaces and convert to uppercase
    const cleanPassport = passport.replace(/\s/g, '').toUpperCase();

    // Check length (Ecuador passports are typically 9 characters)
    if (cleanPassport.length < 6 || cleanPassport.length > 12) {
      return {
        isValid: false,
        error: 'Passport must be between 6-12 characters'
      };
    }

    // Check format (alphanumeric only)
    if (!/^[A-Z0-9]+$/.test(cleanPassport)) {
      return {
        isValid: false,
        error: 'Passport must contain only letters and numbers'
      };
    }

    return {
      isValid: true,
      formattedPassport: cleanPassport
    };
  }

  /**
   * Submit a background check request
   */
  async submitBackgroundCheck(request: BackgroundCheckRequest): Promise<{ success: boolean; id?: number; error?: string }> {
    try {
      // Validate document based on type
      let validationResult;
      if (request.documentType === 'cedula') {
        validationResult = this.validateCedula(request.documentNumber);
      } else {
        validationResult = this.validatePassport(request.documentNumber);
      }

      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.error
        };
      }

      // Check if user already has a pending or approved background check
      const existingCheck = await this.getPool().query(
        `SELECT id, status, expires_at FROM background_checks 
         WHERE user_id = $1 AND status IN ('pending', 'approved') 
         ORDER BY created_at DESC LIMIT 1`,
        [request.userId]
      );

      if (existingCheck.rows.length > 0) {
        const existing = existingCheck.rows[0];
        if (existing.status === 'pending') {
          return {
            success: false,
            error: 'You already have a pending background check request'
          };
        }
        if (existing.status === 'approved' && new Date(existing.expires_at) > new Date()) {
          return {
            success: false,
            error: 'Your background check is still valid'
          };
        }
      }

      // Get the formatted document number
      const formattedDocumentNumber = request.documentType === 'cedula' 
        ? (validationResult as CedulaValidationResult).formattedCedula
        : (validationResult as PassportValidationResult).formattedPassport;

      // Insert new background check request
      const result = await this.getPool().query(
        `INSERT INTO background_checks 
         (user_id, document_type, document_number, full_name, birth_date, document_photo_url, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
         RETURNING id`,
        [
          request.userId,
          request.documentType,
          formattedDocumentNumber,
          request.fullName,
          request.birthDate,
          request.documentPhotoUrl
        ]
      );

      return {
        success: true,
        id: result.rows[0].id
      };
    } catch (error) {
      console.error('Error submitting background check:', error);
      return {
        success: false,
        error: 'Failed to submit background check request'
      };
    }
  }

  /**
   * Get background check status for a user
   */
  async getBackgroundCheckStatus(userId: string): Promise<BackgroundCheckStatus | null> {
    try {
      const result = await this.getPool().query(
        `SELECT id, user_id, status, document_type, document_number, 
                created_at as submitted_at, reviewed_at, expires_at, admin_notes
         FROM background_checks 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        status: row.status,
        documentType: row.document_type,
        documentNumber: row.document_number,
        submittedAt: row.submitted_at,
        reviewedAt: row.reviewed_at,
        expiresAt: row.expires_at,
        adminNotes: row.admin_notes
      };
    } catch (error) {
      console.error('Error getting background check status:', error);
      return null;
    }
  }

  /**
   * Check if user needs background check renewal (90-day expiry)
   */
  async needsRenewal(userId: string): Promise<boolean> {
    try {
      const status = await this.getBackgroundCheckStatus(userId);
      
      if (!status || status.status !== 'approved') {
        return true;
      }

      if (!status.expiresAt) {
        return true;
      }

      return new Date(status.expiresAt) <= new Date();
    } catch (error) {
      console.error('Error checking renewal status:', error);
      return true;
    }
  }

  /**
   * Admin: Get pending background check requests
   */
  async getPendingRequests(limit: number = 50, offset: number = 0): Promise<any[]> {
    try {
      const result = await this.getPool().query(
        `SELECT bc.*, u.email, u.phone_number, u.first_name, u.last_name
         FROM background_checks bc
         JOIN users u ON bc.user_id = u.id
         WHERE bc.status = 'pending'
         ORDER BY bc.created_at ASC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting pending requests:', error);
      return [];
    }
  }

  /**
   * Admin: Approve background check
   */
  async approveBackgroundCheck(id: number, adminNotes?: string): Promise<boolean> {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90); // 90-day expiry

      await this.getPool().query(
        `UPDATE background_checks 
         SET status = 'approved', reviewed_at = NOW(), expires_at = $1, admin_notes = $2
         WHERE id = $3`,
        [expiresAt, adminNotes, id]
      );

      return true;
    } catch (error) {
      console.error('Error approving background check:', error);
      return false;
    }
  }

  /**
   * Admin: Reject background check
   */
  async rejectBackgroundCheck(id: number, adminNotes: string): Promise<boolean> {
    try {
      await this.getPool().query(
        `UPDATE background_checks 
         SET status = 'rejected', reviewed_at = NOW(), admin_notes = $1
         WHERE id = $2`,
        [adminNotes, id]
      );

      return true;
    } catch (error) {
      console.error('Error rejecting background check:', error);
      return false;
    }
  }
}