import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import {
  getTurfReviewsQueryFn,
  getUserReviewsQueryFn,
  createReviewMutationFn,
  markReviewHelpfulMutationFn,
} from "../api";

type TurfReviewsParams = {
  page?: number;
  limit?: number;
  rating?: number;
};

type TurfReviewsResponse = {
  reviews: Review[];
  pagination: { page: number; limit: number; total: number };
  averageRating: number;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type UserReviewsResponse = {
  reviews: Review[];
  pagination: Pagination;
};

type Review = {
  id: string;
  userId: string;
  turfId: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
};

type CreateReviewRequest = {
  rating: number;
  comment: string;
};

type ApiError = {
  message: string;
  code: string;
};

// ==================== QUERY HOOKS ====================

/**
 * Hook to get reviews for a specific turf
 */
export const useTurfReviews = (
  turfId: string,
  params: TurfReviewsParams = {},
  options?: {
    enabled?: boolean;
    keepPreviousData?: boolean;
  },
) => {
  return useQuery<TurfReviewsResponse, AxiosError<ApiError>>({
    queryKey: ["turf-reviews", turfId, params],
    queryFn: () => getTurfReviewsQueryFn(turfId, params),
    enabled: options?.enabled !== false && !!turfId,
    placeholderData: options?.keepPreviousData ? undefined : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

};

/**
 * Hook to get current user's reviews
 */
export const useUserReviews = (
  params: Pagination = { page: 1, limit: 20, total: 0, totalPages: 0 },
  options?: {
    enabled?: boolean;
    keepPreviousData?: boolean;
  },
) => {
  return useQuery<UserReviewsResponse, AxiosError<ApiError>>({
    queryKey: ["user-reviews", params],
    queryFn: () => getUserReviewsQueryFn(params),
    enabled: options?.enabled !== false,
    placeholderData: options?.keepPreviousData ? undefined : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ==================== MUTATION HOOKS ====================

/**
 * Hook to create a new review for a turf
 */
export const useCreateReview = (options?: {
  onSuccess?: (data: Review) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<
    Review,
    AxiosError<ApiError>,
    { turfId: string; request: CreateReviewRequest }
  >({
    mutationFn: ({
      turfId,
      request,
    }: {
      turfId: string;
      request: CreateReviewRequest;
    }) => createReviewMutationFn(turfId, request),
    onSuccess: (data, variables) => {
      // Invalidate turf reviews to show the new review
      queryClient.invalidateQueries({
        queryKey: ["turf-reviews", variables.turfId],
      });
      // Invalidate user reviews to show the new review
      queryClient.invalidateQueries({
        queryKey: ["user-reviews"],
      });
      // Invalidate turf details to update rating
      queryClient.invalidateQueries({
        queryKey: ["turf-details", variables.turfId],
      });
      // Invalidate search results to update rating
      queryClient.invalidateQueries({
        queryKey: ["search-turfs"],
      });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to mark a review as helpful
 */
export const useMarkReviewHelpful = (options?: {
  onSuccess?: (data: { success: boolean }) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, AxiosError<ApiError>, string>({
    mutationFn: markReviewHelpfulMutationFn,
    onSuccess: (data) => {
      // Invalidate all review queries to update helpful count
      queryClient.invalidateQueries({
        queryKey: ["turf-reviews"],
      });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};
