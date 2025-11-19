import { Request, Response } from 'express';
import { DocumentRepository } from '../repositories/DocumentRepository';
import { FileUploadService } from '../services/FileUploadService';
import { DocumentType, DocumentUploadRequest } from '../models/Document';

export class DocumentController {
  private documentRepository: DocumentRepository;
  private fileUploadService: FileUploadService;

  constructor(documentRepository: DocumentRepository, fileUploadService: FileUploadService) {
    this.documentRepository = documentRepository;
    this.fileUploadService = fileUploadService;
  }

  /**
   * Upload a document
   * POST /api/documents/upload
   */
  uploadDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
        return;
      }

      const { documentType, fileData, fileName, mimeType }: DocumentUploadRequest = req.body;

      // Validate required fields
      if (!documentType || !fileData || !fileName || !mimeType) {
        res.status(400).json({
          success: false,
          error: 'Todos los campos son requeridos',
          details: {
            documentType: !documentType ? 'Tipo de documento es requerido' : undefined,
            fileData: !fileData ? 'Datos del archivo son requeridos' : undefined,
            fileName: !fileName ? 'Nombre del archivo es requerido' : undefined,
            mimeType: !mimeType ? 'Tipo MIME es requerido' : undefined
          }
        });
        return;
      }

      // Validate document type
      const validDocumentTypes: DocumentType[] = [
        'profile_photo',
        'identity_document',
        'driver_license',
        'vehicle_registration',
        'vehicle_insurance',
        'background_check_document'
      ];

      if (!validDocumentTypes.includes(documentType)) {
        res.status(400).json({
          success: false,
          error: 'Tipo de documento inválido'
        });
        return;
      }

      // Check if file upload service is configured
      if (!this.fileUploadService.isConfigured()) {
        res.status(503).json({
          success: false,
          error: 'Servicio de almacenamiento no configurado'
        });
        return;
      }

      // Convert base64 to buffer
      let fileBuffer: Buffer;
      try {
        // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
        const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData;
        fileBuffer = Buffer.from(base64Data, 'base64');
      } catch (error) {
        res.status(400).json({
          success: false,
          error: 'Datos del archivo inválidos'
        });
        return;
      }

      // Determine folder based on document type
      const folder = this.getFolderForDocumentType(documentType);

      // Upload file to DigitalOcean Spaces
      const uploadResult = await this.fileUploadService.uploadFile(
        fileBuffer,
        fileName,
        mimeType,
        folder,
        req.user.id
      );

      if (!uploadResult.success) {
        res.status(400).json({
          success: false,
          error: uploadResult.error
        });
        return;
      }

      // Save document record to database
      const document = await this.documentRepository.createDocument({
        userId: req.user.id,
        documentType,
        fileName: uploadResult.fileName!,
        originalFileName: fileName,
        fileUrl: uploadResult.fileUrl!,
        fileSize: uploadResult.fileSize!,
        mimeType,
        metadata: {
          originalName: fileName,
          uploadedBy: req.user.id,
          uploadTimestamp: new Date().toISOString()
        }
      });

      res.status(201).json({
        success: true,
        message: 'Documento subido exitosamente',
        data: {
          document
        }
      });

    } catch (error) {
      console.error('Document upload error:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Get user's documents
   * GET /api/documents
   */
  getUserDocuments = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
        return;
      }

      const documentType = req.query.type as DocumentType;

      const documents = await this.documentRepository.findByUserId(req.user.id, documentType);

      res.json({
        success: true,
        data: {
          documents
        }
      });

    } catch (error) {
      console.error('Get user documents error:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Get specific document
   * GET /api/documents/:documentId
   */
  getDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
        return;
      }

      const { documentId } = req.params;

      const document = await this.documentRepository.findById(documentId);

      if (!document) {
        res.status(404).json({
          success: false,
          error: 'Documento no encontrado'
        });
        return;
      }

      // Check if user owns the document
      if (document.userId !== req.user.id) {
        res.status(403).json({
          success: false,
          error: 'No tienes permiso para acceder a este documento'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          document
        }
      });

    } catch (error) {
      console.error('Get document error:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Delete document
   * DELETE /api/documents/:documentId
   */
  deleteDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
        return;
      }

      const { documentId } = req.params;

      // Get document first to check ownership and get file URL
      const document = await this.documentRepository.findById(documentId);

      if (!document) {
        res.status(404).json({
          success: false,
          error: 'Documento no encontrado'
        });
        return;
      }

      // Check if user owns the document
      if (document.userId !== req.user.id) {
        res.status(403).json({
          success: false,
          error: 'No tienes permiso para eliminar este documento'
        });
        return;
      }

      // Don't allow deletion of approved documents
      if (document.verificationStatus === 'approved') {
        res.status(400).json({
          success: false,
          error: 'No se puede eliminar un documento aprobado'
        });
        return;
      }

      // Delete from database
      const deleted = await this.documentRepository.deleteDocument(documentId, req.user.id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Documento no encontrado'
        });
        return;
      }

      // Delete file from storage (async, don't wait for result)
      this.fileUploadService.deleteFile(document.fileUrl).catch(error => {
        console.error('Failed to delete file from storage:', error);
      });

      res.json({
        success: true,
        message: 'Documento eliminado exitosamente'
      });

    } catch (error) {
      console.error('Delete document error:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Generate presigned upload URL for large files
   * POST /api/documents/presigned-url
   */
  generatePresignedUrl = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
        return;
      }

      const { documentType, fileName, mimeType } = req.body;

      if (!documentType || !fileName || !mimeType) {
        res.status(400).json({
          success: false,
          error: 'Tipo de documento, nombre de archivo y tipo MIME son requeridos'
        });
        return;
      }

      // Check if file upload service is configured
      if (!this.fileUploadService.isConfigured()) {
        res.status(503).json({
          success: false,
          error: 'Servicio de almacenamiento no configurado'
        });
        return;
      }

      const folder = this.getFolderForDocumentType(documentType);

      const urlData = await this.fileUploadService.generatePresignedUploadUrl(
        fileName,
        mimeType,
        folder,
        req.user.id
      );

      res.json({
        success: true,
        data: {
          uploadUrl: urlData.uploadUrl,
          fileUrl: urlData.fileUrl,
          filePath: urlData.filePath,
          expiresIn: 3600 // 1 hour
        }
      });

    } catch (error) {
      console.error('Generate presigned URL error:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Get document statistics (admin only)
   * GET /api/documents/stats
   */
  getDocumentStats = async (req: Request, res: Response): Promise<void> => {
    try {
      // This would typically require admin authentication
      // For now, we'll implement basic stats

      const stats = await this.documentRepository.getDocumentStats();

      res.json({
        success: true,
        data: {
          stats
        }
      });

    } catch (error) {
      console.error('Get document stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Get folder name for document type
   * @param documentType - Document type
   * @returns Folder name
   */
  private getFolderForDocumentType(documentType: DocumentType): string {
    const folderMap: Record<DocumentType, string> = {
      'profile_photo': 'profiles',
      'identity_document': 'identity',
      'driver_license': 'licenses',
      'vehicle_registration': 'vehicles',
      'vehicle_insurance': 'insurance',
      'background_check_document': 'background-checks'
    };

    return folderMap[documentType] || 'documents';
  }
}