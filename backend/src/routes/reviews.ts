import { Router } from 'express';
import { ReviewController } from '../controllers/ReviewController';
import { ReviewRepository } from '../repositories/ReviewRepository';
import { UserRepository } from '../repositories/UserRepository';
import { getPool } from '../config/database';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

// Lazy initialization of dependencies
let reviewController: ReviewController;

function getReviewController(): ReviewController {
  if (!reviewController) {
    const pool = getPool();
    const reviewRepository = new ReviewRepository(pool);
    const userRepository = new UserRepository(pool);
    reviewController = new ReviewController(reviewRepository, userRepository);
  }
  return reviewController;
}

/**
 * @route POST /api/reviews
 * @desc Create a new review
 * @access Private
 */
router.post('/', authenticateToken, (req, res) => getReviewController().createReview(req, res));

/**
 * @route GET /api/reviews/user/:userId
 * @desc Get reviews for a user
 * @access Public
 */
router.get('/user/:userId', optionalAuth, (req, res) => getReviewController().getUserReviews(req, res));

/**
 * @route GET /api/reviews/summary/:userId
 * @desc Get review summary for a user
 * @access Public
 */
router.get('/summary/:userId', optionalAuth, (req, res) => getReviewController().getReviewSummary(req, res));

/**
 * @route DELETE /api/reviews/:reviewId
 * @desc Delete a review
 * @access Private
 */
router.delete('/:reviewId', authenticateToken, (req, res) => getReviewController().deleteReview(req, res));

export default router;