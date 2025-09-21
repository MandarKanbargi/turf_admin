import { apiClient } from "./config";
import type {
  TurfSearchResponse,
  TurfSearchParams,
  ApiResponse,
  TurfDetails,
} from "@/types";

// ==================== QUERY FUNCTIONS ====================

/**
 * Search turfs with filters
 */
export const searchTurfsQueryFn = async (
  params: TurfSearchParams = {},
): Promise<TurfSearchResponse> => {
  const response = await apiClient.get<ApiResponse<TurfSearchResponse>>(
    "/turfs/search",
    { params },
  );
  return response.data.data;
};

/**
 * Get detailed information about a specific turf
 */
export const getTurfDetailsQueryFn = async (
  turfId: string,
): Promise<TurfDetails> => {
  const response = await apiClient.get<ApiResponse<TurfDetails>>(
    `/turfs/${turfId}`,
  );
  return response.data.data;
};
