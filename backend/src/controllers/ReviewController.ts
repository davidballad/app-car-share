import { Request, Response } from 'express';
import { ReviewRepository } from '../repositories/ReviewRepository';
import { UserRepository } from '../repositories/UserRepository';

export class ReviewController {
  private reviewRepository: ReviewRepository;
  private userRepository: UserRepository;

  constructor(reviewRepository: ReviewRepository, userRepository: UserRepository) {
    this.reviewRepository = reviewRepository;
    this.userRepository = userRepository;
  }

  /**
   * Create a new review
   * POST /api/reviews
   */
  createReview = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
        return;
      }

      const { tripId, revieweeId, rating, comment, reviewType } = req.body;

      // Validate required fields
      if (!tripId || !revieweeId || !rating || !reviewType) {
        res.status(400).json({
          success: false,
          error: 'Todos los campos requeridos deben ser completados',
          details: {
            tripId: !tripId ? 'ID de viaje es requerido' : undefined,
            revieweeId: !revieweeId ? 'ID de usuario a evaluar es requerido' : undefined,
            rating: !rating ? 'Calificación es requerida' : undefined,
            reviewType: !reviewType ? 'Tipo de evaluación es requerido' : undefined
          }
        });
        return;
      }

      // Validate rating range
      if (rating < 1 || rating > 5) {
        res.status(400).json({
          success: false,
          error: 'La calificación debe estar entre 1 y 5 estrellas'
        });
        return;
      }

      // Validate review type
      if (!['driver', 'passenger'].includes(reviewType)) {
        res.status(400).json({
          success: false,
          error: 'Tipo de evaluación inválido'
        });
        return;
      }

      // Check if reviewee exists
      const reviewee = await this.userRepository.findById(revieweeId);
      if (!reviewee) {
        res.status(404).json({
          success: false,
          error: 'Usuario a evaluar no encontrado'
        });
        return;
      }

      // Check if user is trying to review themselves
      if (req.user.id === revieweeId) {
        res.status(400).json({
          success: false,
          error: 'No puedes evaluarte a ti mismo'
        });
        return;
      }

      // Check if user has already reviewed this person for this trip
      const hasReviewed = await this.reviewRepository.hasUserReviewed(tripId, req.user.id, revieweeId);
      if (hasReviewed) {
        res.status(409).json({
          success: false,
          error: 'Ya has evaluado a este usuario para este viaje'
        });
        return;
      }

      // Create review
      const review = await this.reviewRepository.createReview({
        tripId,
        reviewerId: req.user.id,
        revieweeId,
        rating,
        comment: comment?.trim(),
        reviewType
      });

      // Update user's average rating
      await this.reviewRepository.updateUserRating(revieweeId);

      res.status(201).json({
        success: true,
        message: 'Evaluación creada exitosamente',
        data: {
          review
        }
      });

    } catch (error) {
      console.error('Create review error:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Get reviews for a user
   * GET /api/reviews/user/:userId
   */
  getUserReviews = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
      const offset = (page - 1) * limit;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'ID de usuario requerido'
        });
        return;
      }

      // Check if user exists
      const user = await this.userRepository.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
        return;
      }

      // Get reviews and summary
      const [reviews, summary] = await Promise.all([
        this.reviewRepository.getReviewsForUser(userId, limit, offset),
        this.reviewRepository.getReviewSummary(userId)
      ]);

      res.json({
        success: true,
        data: {
          reviews,
          summary,
          pagination: {
            page,
            limit,
            total: summary.totalReviews,
            totalPages: Math.ceil(summary.totalReviews / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get user reviews error:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Get review summary for a user
   * GET /api/reviews/summary/:userId
   */
  getReviewSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'ID de usuario requerido'
        });
        return;
      }

      // Check if user exists
      const user = await this.userRepository.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
        return;
      }

      const summary = await this.reviewRepository.getReviewSummary(userId);

      res.json({
        success: true,
        data: {
          summary
        }
      });

    } catch (error) {
      console.error('Get review summary error:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Delete a review
   * DELETE /api/reviews/:reviewId
   */
  deleteReview = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
        return;
      }

      const { reviewId } = req.params;

      if (!reviewId) {
        res.status(400).json({
          success: false,
          error: 'ID de evaluación requerido'
        });
        return;
      }

      // Get review to check ownership and get reviewee ID
      const review = await this.reviewRepository.findById(reviewId);
      if (!review) {
        res.status(404).json({
          success: false,
          error: 'Evaluación no encontrada'
        });
        return;
      }

      // Check if user owns the review
      if (review.reviewerId !== req.user.id) {
        res.status(403).json({
          success: false,
          error: 'No tienes permiso para eliminar esta evaluación'
        });
        return;
      }

      // Delete review
      const deleted = await this.reviewRepository.deleteReview(reviewId, req.user.id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Evaluación no encontrada'
        });
        return;
      }

      // Update user's average rating
      await this.reviewRepository.updateUserRating(review.revieweeId);

      res.json({
        success: true,
        message: 'Evaluación eliminada exitosamente'
      });

    } catch (error) {
      console.error('Delete review error:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };
}