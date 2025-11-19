export interface Document {
  id: string;
  userId: string;
  documentType: DocumentType;
  fileName: string;
  originalFileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadStatus: UploadStatus;
  verificationStatus: DocumentVerificationStatus;
  metadata?: DocumentMetadata;
  uploadedAt: Date;
  updatedAt: Date;
}

export type DocumentType = 
  | 'profile_photo'
  | 'identity_document'
  | 'driver_license'
  | 'vehicle_registration'
  | 'vehicle_insurance'
  | 'background_check_document';

export type UploadStatus = 
  | 'uploading'
  | 'completed'
  | 'failed';

export type DocumentVerificationStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'expired';

export interface DocumentMetadata {
  originalName?: string;
  uploadedBy?: string;
  uploadTimestamp?: string;
  expiryDate?: Date;
  verificationNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface CreateDocumentRequest {
  userId: string;
  documentType: DocumentType;
  fileName: string;
  originalFileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  metadata?: DocumentMetadata;
}

export interface DocumentUploadRequest {
  documentType: DocumentType;
  fileData: string; // Base64 encoded file data
  fileName: string;
  mimeType: string;
}

export interface DocumentUploadResponse {
  success: boolean;
  document?: Document;
  error?: string;
}