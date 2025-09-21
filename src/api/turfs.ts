import { apiClient } from "./client";

/**
 * Search turfs with filters
 */
export const searchTurfs = async (
  params: TurfSearchParams = {},
): Promise<ApiResponse<TurfSearchResponse>> => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });

  return (await apiClient.get(`/turfs/search?${searchParams.toString()}`)).data;
};

/**
 * Get detailed turf information
 */
export const getTurfDetails = async (
  turfId: string,
): Promise<ApiResponse<TurfDetails>> => {
  return (await apiClient.get(`/turfs/${turfId}`)).data;
};
