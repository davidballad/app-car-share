import { Pool } from 'pg';
import { Review, CreateReviewRequest, ReviewSummary } from '../models/Review';

export class ReviewRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Create a new review
   * @param reviewData - Review data
   * @returns Created review
   */
  async createReview(reviewData: CreateReviewRequest & { reviewerId: string }): Promise<Review> {
    const query = `
      INSERT INTO reviews (
        trip_id, reviewer_id, reviewee_id, rating, comment, review_type
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING 
        id, trip_id, reviewer_id, reviewee_id, rating, comment, 
        review_type, created_at, updated_at
    `;

    const values = [
      reviewData.tripId,
      reviewData.reviewerId,
      reviewData.revieweeId,
      reviewData.rating,
      reviewData.comment || null,
      reviewData.reviewType
    ];

    const result = await this.pool.query(query, values);
    return this.mapRowToReview(result.rows[0]);
  }

  /**
   * Get review by ID
   * @param reviewId - Review ID
   * @returns Review or null if not found
   */
  async findById(reviewId: string): Promise<Review | null> {
    const query = `
      SELECT 
        id, trip_id, reviewer_id, reviewee_id, rating, comment, 
        review_type, created_at, updated_at
      FROM reviews 
      WHERE id = $1
    `;

    const result = await this.pool.query(query, [reviewId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToReview(result.rows[0]);
  }

  /**
   * Get reviews for a user
   * @param userId - User ID
   * @param limit - Maximum number of reviews
   * @param offset - Offset for pagination
   * @returns Array of reviews
   */
  async getReviewsForUser(userId: string, limit: number = 10, offset: number = 0): Promise<Review[]> {
    const query = `
      SELECT 
        id, trip_id, reviewer_id, reviewee_id, rating, comment, 
        review_type, created_at, updated_at
      FROM reviews 
      WHERE reviewee_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await this.pool.query(query, [userId, limit, offset]);
    return result.rows.map(row => this.mapRowToReview(row));
  }

  /**
   * Get review summary for a user
   * @param userId - User ID
   * @returns Review summary
   */
  async getReviewSummary(userId: string): Promise<ReviewSummary> {
    // Get average rating and total reviews
    const summaryQuery = `
      SELECT 
        AVG(rating)::DECIMAL(3,2) as average_rating,
        COUNT(*) as total_reviews
      FROM reviews 
      WHERE reviewee_id = $1
    `;

    const summaryResult = await this.pool.query(summaryQuery, [userId]);
    const summary = summaryResult.rows[0];

    // Get rating distribution
    const distributionQuery = `
      SELECT 
        rating,
        COUNT(*) as count
      FROM reviews 
      WHERE reviewee_id = $1
      GROUP BY rating
      ORDER BY rating
    `;

    const distributionResult = await this.pool.query(distributionQuery, [userId]);
    
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };

    distributionResult.rows.forEach(row => {
      ratingDistribution[row.rating as keyof typeof ratingDistribution] = parseInt(row.count);
    });

    // Get recent reviews with reviewer names
    const recentReviewsQuery = `
      SELECT 
        r.id, r.rating, r.comment, r.review_type, r.created_at,
        u.first_name, u.last_name
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      WHERE r.reviewee_id = $1
      ORDER BY r.created_at DESC
      LIMIT 5
    `;

    const recentReviewsResult = await this.pool.query(recentReviewsQuery, [userId]);
    
    const recentReviews = recentReviewsResult.rows.map(row => ({
      id: row.id,
      rating: row.rating,
      comment: row.comment,
      reviewerName: `${row.first_name} ${row.last_name}`,
      reviewType: row.review_type as 'driver' | 'passenger',
      createdAt: row.created_at
    }));

    return {
      averageRating: parseFloat(summary.average_rating) || 0,
      totalReviews: parseInt(summary.total_reviews) || 0,
      ratingDistribution,
      recentReviews
    };
  }

  /**
   * Check if user has already reviewed another user for a specific trip
   * @param tripId - Trip ID
   * @param reviewerId - Reviewer ID
   * @param revieweeId - Reviewee ID
   * @returns True if review exists
   */
  async hasUserReviewed(tripId: string, reviewerId: string, revieweeId: string): Promise<boolean> {
    const query = `
      SELECT 1 FROM reviews 
      WHERE trip_id = $1 AND reviewer_id = $2 AND reviewee_id = $3
      LIMIT 1
    `;

    const result = await this.pool.query(query, [tripId, reviewerId, revieweeId]);
    return result.rows.length > 0;
  }

  /**
   * Update user's average rating based on reviews
   * @param userId - User ID
   */
  async updateUserRating(userId: string): Promise<void> {
    const query = `
      UPDATE users 
      SET rating = (
        SELECT AVG(rating)::DECIMAL(3,2) 
        FROM reviews 
        WHERE reviewee_id = $1
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    await this.pool.query(query, [userId]);
  }

  /**
   * Delete review
   * @param reviewId - Review ID
   * @param userId - User ID (must be the reviewer)
   */
  async deleteReview(reviewId: string, userId: string): Promise<boolean> {
    const query = `
      DELETE FROM reviews 
      WHERE id = $1 AND reviewer_id = $2
    `;

    const result = await this.pool.query(query, [reviewId, userId]);
    return (result.rowCount || 0) > 0;
  }

  /**
   * Map database row to Review object
   * @param row - Database row
   * @returns Review object
   */
  private mapRowToReview(row: any): Review {
    return {
      id: row.id,
      tripId: row.trip_id,
      reviewerId: row.reviewer_id,
      revieweeId: row.reviewee_id,
      rating: row.rating,
      comment: row.comment,
      reviewType: row.review_type,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}