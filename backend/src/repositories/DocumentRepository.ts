import { Pool } from 'pg';
import { Document, CreateDocumentRequest, DocumentType, DocumentVerificationStatus } from '../models/Document';

export class DocumentRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Create a new document record
   * @param documentData - Document data
   * @returns Created document
   */
  async createDocument(documentData: CreateDocumentRequest): Promise<Document> {
    const query = `
      INSERT INTO documents (
        user_id, document_type, file_name, original_file_name, 
        file_url, file_size, mime_type, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING 
        id, user_id, document_type, file_name, original_file_name,
        file_url, file_size, mime_type, upload_status, verification_status,
        metadata, uploaded_at, updated_at
    `;

    const values = [
      documentData.userId,
      documentData.documentType,
      documentData.fileName,
      documentData.originalFileName,
      documentData.fileUrl,
      documentData.fileSize,
      documentData.mimeType,
      documentData.metadata ? JSON.stringify(documentData.metadata) : null
    ];

    const result = await this.pool.query(query, values);
    return this.mapRowToDocument(result.rows[0]);
  }

  /**
   * Get document by ID
   * @param documentId - Document ID
   * @returns Document or null if not found
   */
  async findById(documentId: string): Promise<Document | null> {
    const query = `
      SELECT 
        id, user_id, document_type, file_name, original_file_name,
        file_url, file_size, mime_type, upload_status, verification_status,
        metadata, uploaded_at, updated_at
      FROM documents 
      WHERE id = $1
    `;

    const result = await this.pool.query(query, [documentId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToDocument(result.rows[0]);
  }

  /**
   * Get documents by user ID
   * @param userId - User ID
   * @param documentType - Optional document type filter
   * @returns Array of documents
   */
  async findByUserId(userId: string, documentType?: DocumentType): Promise<Document[]> {
    let query = `
      SELECT 
        id, user_id, document_type, file_name, original_file_name,
        file_url, file_size, mime_type, upload_status, verification_status,
        metadata, uploaded_at, updated_at
      FROM documents 
      WHERE user_id = $1
    `;

    const values: any[] = [userId];

    if (documentType) {
      query += ' AND document_type = $2';
      values.push(documentType);
    }

    query += ' ORDER BY uploaded_at DESC';

    const result = await this.pool.query(query, values);
    return result.rows.map(row => this.mapRowToDocument(row));
  }

  /**
   * Get latest document of specific type for user
   * @param userId - User ID
   * @param documentType - Document type
   * @returns Latest document or null
   */
  async findLatestByType(userId: string, documentType: DocumentType): Promise<Document | null> {
    const query = `
      SELECT 
        id, user_id, document_type, file_name, original_file_name,
        file_url, file_size, mime_type, upload_status, verification_status,
        metadata, uploaded_at, updated_at
      FROM documents 
      WHERE user_id = $1 AND document_type = $2
      ORDER BY uploaded_at DESC
      LIMIT 1
    `;

    const result = await this.pool.query(query, [userId, documentType]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToDocument(result.rows[0]);
  }

  /**
   * Update document verification status
   * @param documentId - Document ID
   * @param status - New verification status
   * @param reviewNotes - Optional review notes
   * @param reviewedBy - ID of reviewer
   */
  async updateVerificationStatus(
    documentId: string, 
    status: DocumentVerificationStatus,
    reviewNotes?: string,
    reviewedBy?: string
  ): Promise<void> {
    const query = `
      UPDATE documents 
      SET verification_status = $2,
          metadata = COALESCE(metadata, '{}'::jsonb) || $3::jsonb,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    const metadataUpdate = {
      verificationNotes: reviewNotes,
      reviewedBy,
      reviewedAt: new Date().toISOString()
    };

    await this.pool.query(query, [documentId, status, JSON.stringify(metadataUpdate)]);
  }

  /**
   * Delete document
   * @param documentId - Document ID
   * @param userId - User ID (for security)
   * @returns True if deleted
   */
  async deleteDocument(documentId: string, userId: string): Promise<boolean> {
    const query = `
      DELETE FROM documents 
      WHERE id = $1 AND user_id = $2
    `;

    const result = await this.pool.query(query, [documentId, userId]);
    return (result.rowCount || 0) > 0;
  }

  /**
   * Get documents pending verification
   * @param limit - Maximum number of documents
   * @param offset - Offset for pagination
   * @returns Array of documents pending verification
   */
  async getPendingVerifications(limit: number = 50, offset: number = 0): Promise<{
    documents: Array<Document & { userInfo: { firstName: string; lastName: string; email: string } }>;
    total: number;
  }> {
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM documents d
      WHERE d.verification_status = 'pending'
    `;
    const countResult = await this.pool.query(countQuery);
    const total = parseInt(countResult.rows[0].total);

    // Get documents with user info
    const query = `
      SELECT 
        d.id, d.user_id, d.document_type, d.file_name, d.original_file_name,
        d.file_url, d.file_size, d.mime_type, d.upload_status, d.verification_status,
        d.metadata, d.uploaded_at, d.updated_at,
        u.first_name, u.last_name, u.email
      FROM documents d
      JOIN users u ON d.user_id = u.id
      WHERE d.verification_status = 'pending'
      ORDER BY d.uploaded_at ASC
      LIMIT $1 OFFSET $2
    `;

    const result = await this.pool.query(query, [limit, offset]);
    
    const documents = result.rows.map(row => ({
      ...this.mapRowToDocument(row),
      userInfo: {
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email
      }
    }));

    return { documents, total };
  }

  /**
   * Get expired documents that need renewal
   * @returns Array of expired documents
   */
  async getExpiredDocuments(): Promise<Document[]> {
    const query = `
      SELECT 
        id, user_id, document_type, file_name, original_file_name,
        file_url, file_size, mime_type, upload_status, verification_status,
        metadata, uploaded_at, updated_at
      FROM documents 
      WHERE verification_status = 'approved'
        AND metadata->>'expiryDate' IS NOT NULL
        AND (metadata->>'expiryDate')::timestamp < CURRENT_TIMESTAMP
      ORDER BY (metadata->>'expiryDate')::timestamp ASC
    `;

    const result = await this.pool.query(query);
    return result.rows.map(row => this.mapRowToDocument(row));
  }

  /**
   * Get documents expiring soon
   * @param daysBeforeExpiry - Number of days before expiry to check
   * @returns Array of documents expiring soon
   */
  async getExpiringDocuments(daysBeforeExpiry: number = 30): Promise<Document[]> {
    const query = `
      SELECT 
        id, user_id, document_type, file_name, original_file_name,
        file_url, file_size, mime_type, upload_status, verification_status,
        metadata, uploaded_at, updated_at
      FROM documents 
      WHERE verification_status = 'approved'
        AND metadata->>'expiryDate' IS NOT NULL
        AND (metadata->>'expiryDate')::timestamp > CURRENT_TIMESTAMP
        AND (metadata->>'expiryDate')::timestamp <= CURRENT_TIMESTAMP + INTERVAL '${daysBeforeExpiry} days'
      ORDER BY (metadata->>'expiryDate')::timestamp ASC
    `;

    const result = await this.pool.query(query);
    return result.rows.map(row => this.mapRowToDocument(row));
  }

  /**
   * Get document statistics
   * @returns Document statistics
   */
  async getDocumentStats(): Promise<{
    total: number;
    byStatus: Record<DocumentVerificationStatus, number>;
    byType: Record<DocumentType, number>;
    pendingCount: number;
    expiredCount: number;
  }> {
    // Get total count
    const totalQuery = 'SELECT COUNT(*) as total FROM documents';
    const totalResult = await this.pool.query(totalQuery);
    const total = parseInt(totalResult.rows[0].total);

    // Get count by status
    const statusQuery = `
      SELECT verification_status, COUNT(*) as count
      FROM documents
      GROUP BY verification_status
    `;
    const statusResult = await this.pool.query(statusQuery);
    const byStatus = statusResult.rows.reduce((acc, row) => {
      acc[row.verification_status] = parseInt(row.count);
      return acc;
    }, {} as Record<DocumentVerificationStatus, number>);

    // Get count by type
    const typeQuery = `
      SELECT document_type, COUNT(*) as count
      FROM documents
      GROUP BY document_type
    `;
    const typeResult = await this.pool.query(typeQuery);
    const byType = typeResult.rows.reduce((acc, row) => {
      acc[row.document_type] = parseInt(row.count);
      return acc;
    }, {} as Record<DocumentType, number>);

    // Get pending count
    const pendingCount = byStatus.pending || 0;

    // Get expired count
    const expiredQuery = `
      SELECT COUNT(*) as count
      FROM documents 
      WHERE verification_status = 'approved'
        AND metadata->>'expiryDate' IS NOT NULL
        AND (metadata->>'expiryDate')::timestamp < CURRENT_TIMESTAMP
    `;
    const expiredResult = await this.pool.query(expiredQuery);
    const expiredCount = parseInt(expiredResult.rows[0].count);

    return {
      total,
      byStatus,
      byType,
      pendingCount,
      expiredCount
    };
  }

  /**
   * Map database row to Document object
   * @param row - Database row
   * @returns Document object
   */
  private mapRowToDocument(row: any): Document {
    return {
      id: row.id,
      userId: row.user_id,
      documentType: row.document_type,
      fileName: row.file_name,
      originalFileName: row.original_file_name,
      fileUrl: row.file_url,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      uploadStatus: row.upload_status,
      verificationStatus: row.verification_status,
      metadata: row.metadata,
      uploadedAt: row.uploaded_at,
      updatedAt: row.updated_at
    };
  }
}