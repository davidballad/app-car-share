import { Request, Response } from 'express';
import { VerificationRepository } from '../repositories/VerificationRepository';
import { DocumentRepository } from '../repositories/DocumentRepository';
import { EcuadorBackgroundCheckService } from '../services/EcuadorBackgroundCheckService';
import { getPool } from '../config/database';
import { NotificationService } from '../services/NotificationService';

export class AdminVerificationController {
  private verificationRepository: VerificationRepository;
  private documentRepository: DocumentRepository;
  private backgroundCheckService: EcuadorBackgroundCheckService;
  private notificationService: NotificationService;

  constructor() {
    const pool = getPool();
    this.verificationRepository = new VerificationRepository(pool);
    this.documentRepository = new DocumentRepository(pool);
    this.backgroundCheckService = new EcuadorBackgroundCheckService();
    this.notificationService = new NotificationService(pool);
  }

  /**
   * Get verification queue with pending requests
   * GET /api/admin/verification/queue
   */
  getVerificationQueue = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const type = req.query.type as string; // 'identity', 'background', 'driver', 'vehicle'

      const queue = await this.verificationRepository.getVerificationQueue({
        page,
        limit,
        type
      });

      res.json({
        success: true,
        data: {
          requests: queue.requests,
          pagination: {
            page,
            limit,
            total: queue.total,
            totalPages: Math.ceil(queue.total / limit)
          },
          stats: {
            pending: queue.stats.pending,
            processing: queue.stats.processing,
            total: queue.stats.total
          }
        }
      });

    } catch (error) {
      console.error('Get verification queue error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get verification queue'
      });
    }
  };

  /**
   * Get specific verification request details
   * GET /api/admin/verification/requests/:id
   */
  getVerificationRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const requestId = parseInt(id);

      if (isNaN(requestId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid request ID'
        });
        return;
      }

      const request = await this.verificationRepository.getVerificationRequestDetails(requestId);

      if (!request) {
        res.status(404).json({
          success: false,
          error: 'Verification request not found'
        });
        return;
      }

      res.json({
        success: true,
        data: request
      });

    } catch (error) {
      console.error('Get verification request error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get verification request'
      });
    }
  };

  /**
   * Approve verification request
   * POST /api/admin/verification/requests/:id/approve
   */
  approveVerificationRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { adminNotes } = req.body;
      const adminId = req.user!.id;
      const requestId = parseInt(id);

      if (isNaN(requestId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid request ID'
        });
        return;
      }

      // Get verification request details first
      const verificationRequest = await this.verificationRepository.getVerificationRequestById(requestId);
      if (!verificationRequest) {
        res.status(404).json({
          success: false,
          error: 'Verification request not found'
        });
        return;
      }

      const success = await this.verificationRepository.approveVerificationRequest(
        requestId,
        adminId,
        adminNotes
      );

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Verification request not found or already processed'
        });
        return;
      }

      // Send approval notification
      await this.notificationService.createNotification({
        userId: verificationRequest.userId,
        type: 'verification_approved',
        title: 'Verificación Aprobada',
        message: 'Tu verificación de antecedentes ha sido aprobada.'
      });

      res.json({
        success: true,
        message: 'Verification request approved successfully'
      });

    } catch (error) {
      console.error('Approve verification request error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to approve verification request'
      });
    }
  };

  /**
   * Reject verification request
   * POST /api/admin/verification/requests/:id/reject
   */
  rejectVerificationRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { adminNotes, reason } = req.body;
      const adminId = req.user!.id;
      const requestId = parseInt(id);

      if (isNaN(requestId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid request ID'
        });
        return;
      }

      if (!adminNotes) {
        res.status(400).json({
          success: false,
          error: 'Admin notes are required for rejection'
        });
        return;
      }

      // Get verification request details first
      const verificationRequest = await this.verificationRepository.getVerificationRequestById(requestId);
      if (!verificationRequest) {
        res.status(404).json({
          success: false,
          error: 'Verification request not found'
        });
        return;
      }

      const success = await this.verificationRepository.rejectVerificationRequest(
        requestId,
        adminId,
        adminNotes,
        reason
      );

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Verification request not found or already processed'
        });
        return;
      }

      // Send rejection notification
      await this.notificationService.createNotification({
        userId: verificationRequest.userId,
        type: 'verification_rejected',
        title: 'Verificación Rechazada',
        message: 'Tu verificación de antecedentes ha sido rechazada. Revisa los documentos y vuelve a intentar.',
        data: { reason, adminNotes }
      });

      res.json({
        success: true,
        message: 'Verification request rejected successfully'
      });

    } catch (error) {
      console.error('Reject verification request error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reject verification request'
      });
    }
  };

  /**
   * Get verification statistics for admin dashboard
   * GET /api/admin/verification/stats
   */
  getVerificationStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const timeframe = req.query.timeframe as string || '30d'; // '7d', '30d', '90d', '1y'
      
      const stats = await this.verificationRepository.getAdminVerificationStats(timeframe);

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Get verification stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get verification statistics'
      });
    }
  };

  /**
   * Bulk approve verification requests
   * POST /api/admin/verification/bulk-approve
   */
  bulkApproveRequests = async (req: Request, res: Response): Promise<void> => {
    try {
      const { requestIds, adminNotes } = req.body;
      const adminId = req.user!.id;

      if (!Array.isArray(requestIds) || requestIds.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Request IDs array is required'
        });
        return;
      }

      if (requestIds.length > 50) {
        res.status(400).json({
          success: false,
          error: 'Cannot process more than 50 requests at once'
        });
        return;
      }

      const results = await this.verificationRepository.bulkApproveRequests(
        requestIds,
        adminId,
        adminNotes
      );

      res.json({
        success: true,
        message: `Successfully processed ${results.approved} requests`,
        data: {
          approved: results.approved,
          failed: results.failed,
          errors: results.errors
        }
      });

    } catch (error) {
      console.error('Bulk approve requests error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to bulk approve requests'
      });
    }
  };

  /**
   * Get admin activity log
   * GET /api/admin/verification/activity
   */
  getAdminActivity = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const adminId = req.query.adminId ? parseInt(req.query.adminId as string) : undefined;

      const activity = await this.verificationRepository.getAdminActivity({
        page,
        limit,
        adminId
      });

      res.json({
        success: true,
        data: {
          activities: activity.activities,
          pagination: {
            page,
            limit,
            total: activity.total,
            totalPages: Math.ceil(activity.total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get admin activity error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get admin activity'
      });
    }
  };
}