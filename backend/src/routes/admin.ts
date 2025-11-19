import { Router } from 'express';
import { AdminVerificationController } from '../controllers/AdminVerificationController';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin, requireModerator } from '../middleware/adminAuth';

const router = Router();

// Lazy initialization
let adminVerificationController: AdminVerificationController;

function getAdminVerificationController(): AdminVerificationController {
  if (!adminVerificationController) {
    adminVerificationController = new AdminVerificationController();
  }
  return adminVerificationController;
}

// All admin routes require authentication and admin/moderator role
router.use(authenticateToken);
router.use(requireModerator);

/**
 * @route GET /api/admin/verification/queue
 * @desc Get verification queue with pending requests
 * @access Private (Admin/Moderator)
 */
router.get('/verification/queue', (req, res) => 
  getAdminVerificationController().getVerificationQueue(req, res)
);

/**
 * @route GET /api/admin/verification/requests/:id
 * @desc Get specific verification request details
 * @access Private (Admin/Moderator)
 */
router.get('/verification/requests/:id', (req, res) => 
  getAdminVerificationController().getVerificationRequest(req, res)
);

/**
 * @route POST /api/admin/verification/requests/:id/approve
 * @desc Approve verification request
 * @access Private (Admin/Moderator)
 */
router.post('/verification/requests/:id/approve', (req, res) => 
  getAdminVerificationController().approveVerificationRequest(req, res)
);

/**
 * @route POST /api/admin/verification/requests/:id/reject
 * @desc Reject verification request
 * @access Private (Admin/Moderator)
 */
router.post('/verification/requests/:id/reject', (req, res) => 
  getAdminVerificationController().rejectVerificationRequest(req, res)
);

/**
 * @route GET /api/admin/verification/stats
 * @desc Get verification statistics for admin dashboard
 * @access Private (Admin/Moderator)
 */
router.get('/verification/stats', (req, res) => 
  getAdminVerificationController().getVerificationStats(req, res)
);

/**
 * @route POST /api/admin/verification/bulk-approve
 * @desc Bulk approve verification requests
 * @access Private (Admin only)
 */
router.post('/verification/bulk-approve', requireAdmin, (req, res) => 
  getAdminVerificationController().bulkApproveRequests(req, res)
);

/**
 * @route GET /api/admin/verification/activity
 * @desc Get admin activity log
 * @access Private (Admin only)
 */
router.get('/verification/activity', requireAdmin, (req, res) => 
  getAdminVerificationController().getAdminActivity(req, res)
);

export default router;