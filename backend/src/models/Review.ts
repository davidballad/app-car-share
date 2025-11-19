export interface Review {
  id: string;
  tripId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  reviewType: 'driver' | 'passenger';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewRequest {
  tripId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  reviewType: 'driver' | 'passenger';
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  recentReviews: Array<{
    id: string;
    rating: number;
    comment?: string;
    reviewerName: string;
    reviewType: 'driver' | 'passenger';
    createdAt: Date;
  }>;
}