import { Router } from 'express';
import { VerificationController } from '../controllers/VerificationController';
import { VerificationRepository } from '../repositories/VerificationRepository';
import { UserRepository } from '../repositories/UserRepository';
import { EcuadorBackgroundCheckService } from '../services/EcuadorBackgroundCheckService';
import { getPool } from '../config/database';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

// Lazy initialization of dependencies
let verificationController: VerificationController;
let backgroundCheckService: EcuadorBackgroundCheckService;

function getVerificationController(): VerificationController {
  if (!verificationController) {
    const pool = getPool();
    const verificationRepository = new VerificationRepository(pool);
    const userRepository = new UserRepository(pool);
    verificationController = new VerificationController(userRepository, verificationRepository);
  }
  return verificationController;
}

function getBackgroundCheckService(): EcuadorBackgroundCheckService {
  if (!backgroundCheckService) {
    backgroundCheckService = new EcuadorBackgroundCheckService();
  }
  return backgroundCheckService;
}

/**
 * @route GET /api/verification/status
 * @desc Get current user's verification status
 * @access Private
 */
router.get('/status', authenticateToken, (req, res) =>
  getVerificationController().getVerificationStatus(req, res)
);

/**
 * @route POST /api/verification/phone
 * @desc Update phone verification status
 * @access Private
 */
router.post('/phone', authenticateToken, (req, res) =>
  getVerificationController().updatePhoneVerification(req, res)
);

/**
 * @route POST /api/verification/identity
 * @desc Submit identity verification
 * @access Private
 */
router.post('/identity', authenticateToken, (req, res) =>
  getVerificationController().submitIdentityVerification(req, res)
);

/**
 * @route GET /api/verification/requirements/:action
 * @desc Get verification requirements for specific actions
 * @access Public (but enhanced with optional auth)
 */
router.get('/requirements/:action', optionalAuth, (req, res) =>
  getVerificationController().getVerificationRequirements(req, res)
);

/**
 * @route GET /api/verification/history
 * @desc Get verification history for current user
 * @access Private
 */
router.get('/history', authenticateToken, (req, res) =>
  getVerificationController().getVerificationHistory(req, res)
);

// Ecuador Background Check Endpoints

/**
 * @route POST /api/verification/background-check/submit
 * @desc Submit background check request
 * @access Private
 */
router.post('/background-check/submit', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { documentType, documentNumber, fullName, birthDate, documentPhotoUrl } = req.body;

    // Validate required fields
    if (!documentType || !documentNumber || !fullName || !birthDate) {
      res.status(400).json({
        success: false,
        error: 'Document type, number, full name, and birth date are required'
      });
      return;
    }

    if (!['cedula', 'passport'].includes(documentType)) {
      res.status(400).json({
        success: false,
        error: 'Document type must be either "cedula" or "passport"'
      });
      return;
    }

    const result = await getBackgroundCheckService().submitBackgroundCheck({
      userId,
      documentType,
      documentNumber,
      fullName,
      birthDate,
      documentPhotoUrl
    });

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Background check request submitted successfully',
      data: { id: result.id }
    });
  } catch (error) {
    console.error('Error submitting background check:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit background check request'
    });
  }
});

/**
 * @route GET /api/verification/background-check/status
 * @desc Get background check status for current user
 * @access Private
 */
router.get('/background-check/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const status = await getBackgroundCheckService().getBackgroundCheckStatus(userId);

    if (!status) {
      res.json({
        success: true,
        data: null,
        message: 'No background check found'
      });
      return;
    }

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting background check status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get background check status'
    });
  }
});

/**
 * @route POST /api/verification/validate/cedula
 * @desc Validate Ecuador cedula format and check digit
 * @access Public
 */
router.post('/validate/cedula', async (req, res) => {
  try {
    const { cedula } = req.body;

    if (!cedula) {
      res.status(400).json({
        success: false,
        error: 'Cedula is required'
      });
      return;
    }

    const validation = getBackgroundCheckService().validateCedula(cedula);

    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error('Error validating cedula:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate cedula'
    });
  }
});

/**
 * @route POST /api/verification/validate/passport
 * @desc Validate Ecuador passport format
 * @access Public
 */
router.post('/validate/passport', async (req, res) => {
  try {
    const { passport } = req.body;

    if (!passport) {
      res.status(400).json({
        success: false,
        error: 'Passport is required'
      });
      return;
    }

    const validation = getBackgroundCheckService().validatePassport(passport);

    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error('Error validating passport:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate passport'
    });
  }
});

// Admin endpoints for background check management

/**
 * @route GET /api/verification/admin/background-checks/pending
 * @desc Get pending background check requests (admin only)
 * @access Private (Admin)
 */
router.get('/admin/background-checks/pending', authenticateToken, async (req, res) => {
  try {
    // TODO: Add admin role check middleware
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const requests = await getBackgroundCheckService().getPendingRequests(limit, offset);

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error getting pending background checks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pending background checks'
    });
  }
});

/**
 * @route POST /api/verification/admin/background-checks/:id/approve
 * @desc Approve background check (admin only)
 * @access Private (Admin)
 */
router.post('/admin/background-checks/:id/approve', authenticateToken, async (req, res) => {
  try {
    // TODO: Add admin role check middleware
    const { id } = req.params;
    const { adminNotes } = req.body;

    const success = await getBackgroundCheckService().approveBackgroundCheck(
      parseInt(id),
      adminNotes
    );

    if (!success) {
      res.status(404).json({
        success: false,
        error: 'Background check not found or could not be approved'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Background check approved successfully'
    });
  } catch (error) {
    console.error('Error approving background check:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve background check'
    });
  }
});

/**
 * @route POST /api/verification/admin/background-checks/:id/reject
 * @desc Reject background check (admin only)
 * @access Private (Admin)
 */
router.post('/admin/background-checks/:id/reject', authenticateToken, async (req, res) => {
  try {
    // TODO: Add admin role check middleware
    const { id } = req.params;
    const { adminNotes } = req.body;

    if (!adminNotes) {
      res.status(400).json({
        success: false,
        error: 'Admin notes are required for rejection'
      });
      return;
    }

    const success = await getBackgroundCheckService().rejectBackgroundCheck(
      parseInt(id),
      adminNotes
    );

    if (!success) {
      res.status(404).json({
        success: false,
        error: 'Background check not found or could not be rejected'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Background check rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting background check:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject background check'
    });
  }
});

export default router;