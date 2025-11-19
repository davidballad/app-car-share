import AWS from 'aws-sdk';
import crypto from 'crypto';
import path from 'path';

export interface UploadResult {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  error?: string;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  fileInfo?: {
    originalName: string;
    mimeType: string;
    size: number;
    extension: string;
  };
}

export class FileUploadService {
  private s3: AWS.S3;
  private bucketName: string;
  private cdnUrl: string;

  constructor() {
    // Configure DigitalOcean Spaces (S3-compatible)
    this.s3 = new AWS.S3({
      endpoint: process.env.DO_SPACES_ENDPOINT || 'https://nyc3.digitaloceanspaces.com',
      accessKeyId: process.env.DO_SPACES_ACCESS_KEY || '',
      secretAccessKey: process.env.DO_SPACES_SECRET_KEY || '',
      region: 'us-east-1', // DigitalOcean Spaces uses us-east-1
      s3ForcePathStyle: false, // Configures to use subdomain/virtual calling format
      signatureVersion: 'v4'
    });

    this.bucketName = process.env.DO_SPACES_BUCKET || 'ecuador-rideshare';
    this.cdnUrl = process.env.DO_SPACES_CDN_URL || `https://${this.bucketName}.nyc3.cdn.digitaloceanspaces.com`;
  }

  /**
   * Upload a file to DigitalOcean Spaces
   * @param fileBuffer - File buffer
   * @param originalName - Original file name
   * @param mimeType - File MIME type
   * @param folder - Folder path (e.g., 'profiles', 'documents')
   * @param userId - User ID for organizing files
   * @returns Upload result
   */
  async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    folder: string,
    userId?: string
  ): Promise<UploadResult> {
    try {
      // Validate file first
      const validation = this.validateFile(fileBuffer, originalName, mimeType);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Generate unique filename
      const fileExtension = path.extname(originalName).toLowerCase();
      const timestamp = Date.now();
      const randomString = crypto.randomBytes(8).toString('hex');
      const fileName = `${timestamp}-${randomString}${fileExtension}`;

      // Create file path
      const filePath = userId 
        ? `${folder}/${userId}/${fileName}`
        : `${folder}/${fileName}`;

      // Upload parameters
      const uploadParams: AWS.S3.PutObjectRequest = {
        Bucket: this.bucketName,
        Key: filePath,
        Body: fileBuffer,
        ContentType: mimeType,
        ACL: 'public-read', // Make files publicly accessible
        CacheControl: 'max-age=31536000', // Cache for 1 year
        Metadata: {
          'original-name': originalName,
          'uploaded-by': userId || 'anonymous',
          'upload-timestamp': timestamp.toString()
        }
      };

      // Upload to DigitalOcean Spaces
      const result = await this.s3.upload(uploadParams).promise();

      // Return CDN URL instead of direct S3 URL for better performance
      const fileUrl = `${this.cdnUrl}/${filePath}`;

      return {
        success: true,
        fileUrl,
        fileName,
        fileSize: fileBuffer.length
      };

    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: 'Error al subir el archivo. Intenta nuevamente.'
      };
    }
  }

  /**
   * Delete a file from DigitalOcean Spaces
   * @param fileUrl - File URL to delete
   * @returns Success status
   */
  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const filePath = this.extractFilePathFromUrl(fileUrl);
      if (!filePath) {
        return false;
      }

      const deleteParams: AWS.S3.DeleteObjectRequest = {
        Bucket: this.bucketName,
        Key: filePath
      };

      await this.s3.deleteObject(deleteParams).promise();
      return true;

    } catch (error) {
      console.error('File deletion error:', error);
      return false;
    }
  }

  /**
   * Generate a presigned URL for direct upload (for large files)
   * @param fileName - File name
   * @param mimeType - File MIME type
   * @param folder - Folder path
   * @param userId - User ID
   * @param expiresIn - URL expiration time in seconds (default: 1 hour)
   * @returns Presigned URL and file path
   */
  async generatePresignedUploadUrl(
    fileName: string,
    mimeType: string,
    folder: string,
    userId?: string,
    expiresIn: number = 3600
  ): Promise<{
    uploadUrl: string;
    fileUrl: string;
    filePath: string;
  }> {
    const fileExtension = path.extname(fileName).toLowerCase();
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const uniqueFileName = `${timestamp}-${randomString}${fileExtension}`;

    const filePath = userId 
      ? `${folder}/${userId}/${uniqueFileName}`
      : `${folder}/${uniqueFileName}`;

    const uploadParams = {
      Bucket: this.bucketName,
      Key: filePath,
      ContentType: mimeType,
      ACL: 'public-read',
      Expires: expiresIn
    };

    const uploadUrl = await this.s3.getSignedUrlPromise('putObject', uploadParams);
    const fileUrl = `${this.cdnUrl}/${filePath}`;

    return {
      uploadUrl,
      fileUrl,
      filePath
    };
  }

  /**
   * Validate file before upload
   * @param fileBuffer - File buffer
   * @param originalName - Original file name
   * @param mimeType - File MIME type
   * @returns Validation result
   */
  private validateFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string
  ): FileValidationResult {
    const fileSize = fileBuffer.length;
    const fileExtension = path.extname(originalName).toLowerCase();

    // File size limits (in bytes)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const MIN_FILE_SIZE = 1024; // 1KB

    // Allowed file types for documents and images
    const ALLOWED_IMAGE_TYPES = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp'
    ];

    const ALLOWED_DOCUMENT_TYPES = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];

    const ALLOWED_EXTENSIONS = [
      '.jpg', '.jpeg', '.png', '.webp', '.pdf'
    ];

    // Check file size
    if (fileSize > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: 'El archivo es demasiado grande. Tamaño máximo: 10MB'
      };
    }

    if (fileSize < MIN_FILE_SIZE) {
      return {
        isValid: false,
        error: 'El archivo es demasiado pequeño. Tamaño mínimo: 1KB'
      };
    }

    // Check file extension
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return {
        isValid: false,
        error: 'Tipo de archivo no permitido. Use: JPG, PNG, WebP o PDF'
      };
    }

    // Check MIME type
    const isValidMimeType = ALLOWED_IMAGE_TYPES.includes(mimeType) || 
                           ALLOWED_DOCUMENT_TYPES.includes(mimeType);

    if (!isValidMimeType) {
      return {
        isValid: false,
        error: 'Tipo de archivo no válido'
      };
    }

    // Validate file signature (magic numbers) for security
    if (!this.validateFileSignature(fileBuffer, mimeType)) {
      return {
        isValid: false,
        error: 'Archivo corrupto o tipo de archivo no válido'
      };
    }

    return {
      isValid: true,
      fileInfo: {
        originalName,
        mimeType,
        size: fileSize,
        extension: fileExtension
      }
    };
  }

  /**
   * Validate file signature (magic numbers) to prevent file type spoofing
   * @param fileBuffer - File buffer
   * @param mimeType - Expected MIME type
   * @returns True if file signature matches MIME type
   */
  private validateFileSignature(fileBuffer: Buffer, mimeType: string): boolean {
    if (fileBuffer.length < 4) return false;

    const signature = fileBuffer.subarray(0, 4);

    switch (mimeType) {
      case 'image/jpeg':
      case 'image/jpg':
        // JPEG: FF D8 FF
        return signature[0] === 0xFF && signature[1] === 0xD8 && signature[2] === 0xFF;
      
      case 'image/png':
        // PNG: 89 50 4E 47
        return signature[0] === 0x89 && signature[1] === 0x50 && 
               signature[2] === 0x4E && signature[3] === 0x47;
      
      case 'image/webp':
        // WebP: 52 49 46 46 (RIFF)
        return signature[0] === 0x52 && signature[1] === 0x49 && 
               signature[2] === 0x46 && signature[3] === 0x46;
      
      case 'application/pdf':
        // PDF: 25 50 44 46 (%PDF)
        return signature[0] === 0x25 && signature[1] === 0x50 && 
               signature[2] === 0x44 && signature[3] === 0x46;
      
      default:
        return false;
    }
  }

  /**
   * Extract file path from CDN URL
   * @param fileUrl - File URL
   * @returns File path or null
   */
  private extractFilePathFromUrl(fileUrl: string): string | null {
    try {
      const url = new URL(fileUrl);
      
      // Handle both direct S3 URLs and CDN URLs
      if (url.hostname.includes('digitaloceanspaces.com')) {
        return url.pathname.substring(1); // Remove leading slash
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get file metadata
   * @param fileUrl - File URL
   * @returns File metadata
   */
  async getFileMetadata(fileUrl: string): Promise<{
    exists: boolean;
    size?: number;
    lastModified?: Date;
    contentType?: string;
  }> {
    try {
      const filePath = this.extractFilePathFromUrl(fileUrl);
      if (!filePath) {
        return { exists: false };
      }

      const headParams: AWS.S3.HeadObjectRequest = {
        Bucket: this.bucketName,
        Key: filePath
      };

      const result = await this.s3.headObject(headParams).promise();

      return {
        exists: true,
        size: result.ContentLength,
        lastModified: result.LastModified,
        contentType: result.ContentType
      };

    } catch (error) {
      return { exists: false };
    }
  }

  /**
   * Check if service is properly configured
   * @returns True if service is configured
   */
  isConfigured(): boolean {
    return !!(
      process.env.DO_SPACES_ACCESS_KEY &&
      process.env.DO_SPACES_SECRET_KEY &&
      process.env.DO_SPACES_BUCKET
    );
  }
}