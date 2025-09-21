import { apiClient } from "./config";
import type {
  TurfReviewsParams,
  ApiResponse,
  TurfReviewsResponse,
  Pagination,
  UserReviewsResponse,
  CreateReviewRequest,
  Review,
} from "@/types";

// ==================== QUERY FUNCTIONS ====================

/**
 * Get reviews for a specific turf
 */
// In api/reviews.ts or similar
export const getTurfReviewsQueryFn = (
  turfId: string,
  params: TurfReviewsParams,
) => {
  return apiClient
    .get<
      ApiResponse<TurfReviewsResponse>
    >(`/turfs/${turfId}/reviews`, { params })
    .then((res) => res.data.data);
};

/**
 * Get current user's reviews
 */
export const getUserReviewsQueryFn = async (
  params: Pagination = { page: 1, limit: 20, total: 0, totalPages: 0 },
): Promise<UserReviewsResponse> => {
  const response = await apiClient.get<ApiResponse<UserReviewsResponse>>(
    "/reviews/my-reviews",
    { params },
  );
  return response.data.data;
};

// ==================== MUTATION FUNCTIONS ====================

/**
 * Create a new review for a turf
 */
export const createReviewMutationFn = async (
  turfId: string,
  request: CreateReviewRequest,
): Promise<Review> => {
  const response = await apiClient.post<ApiResponse<Review>>(
    `/turfs/${turfId}/reviews`,
    request,
  );
  return response.data.data;
};

/**
 * Mark a review as helpful
 */
export const markReviewHelpfulMutationFn = async (
  reviewId: string,
): Promise<{ success: boolean }> => {
  const response = await apiClient.post<ApiResponse<{ success: boolean }>>(
    `/reviews/${reviewId}/helpful`,
  );
  return response.data.data;
};
