import { apiClient } from "./client";

/**
 * Get public Connect & Play listings
 */
export const getConnectPlayListings = async (
  params: ConnectPlayListingsParams = {},
): Promise<ApiResponse<ConnectPlayListingsResponse>> => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });

  return apiClient.get(`/connect-play/listings?${searchParams.toString()}`);
};

/**
 * Create a new Connect & Play listing
 */
export const createConnectPlayListing = async (
  data: CreateConnectPlayRequest,
): Promise<ApiResponse<CreateConnectPlayResponse>> => {
  return apiClient.post("/connect-play/listings", data);
};
