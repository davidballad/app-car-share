import { Router } from 'express';
import { DocumentController } from '../controllers/DocumentController';
import { DocumentRepository } from '../repositories/DocumentRepository';
import { FileUploadService } from '../services/FileUploadService';
import { getPool } from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Lazy initialization of dependencies
let documentController: DocumentController;

function getDocumentController(): DocumentController {
  if (!documentController) {
    const pool = getPool();
    const documentRepository = new DocumentRepository(pool);
    const fileUploadService = new FileUploadService();
    documentController = new DocumentController(documentRepository, fileUploadService);
  }
  return documentController;
}

/**
 * @route POST /api/documents/upload
 * @desc Upload a document
 * @access Private
 */
router.post('/upload', authenticateToken, (req, res) => 
  getDocumentController().uploadDocument(req, res)
);

/**
 * @route GET /api/documents
 * @desc Get user's documents
 * @access Private
 */
router.get('/', authenticateToken, (req, res) => 
  getDocumentController().getUserDocuments(req, res)
);

/**
 * @route GET /api/documents/:documentId
 * @desc Get specific document
 * @access Private
 */
router.get('/:documentId', authenticateToken, (req, res) => 
  getDocumentController().getDocument(req, res)
);

/**
 * @route DELETE /api/documents/:documentId
 * @desc Delete document
 * @access Private
 */
router.delete('/:documentId', authenticateToken, (req, res) => 
  getDocumentController().deleteDocument(req, res)
);

/**
 * @route POST /api/documents/presigned-url
 * @desc Generate presigned upload URL for large files
 * @access Private
 */
router.post('/presigned-url', authenticateToken, (req, res) => 
  getDocumentController().generatePresignedUrl(req, res)
);

/**
 * @route GET /api/documents/stats
 * @desc Get document statistics
 * @access Private (Admin)
 */
router.get('/stats', authenticateToken, (req, res) => 
  getDocumentController().getDocumentStats(req, res)
);

export default router;