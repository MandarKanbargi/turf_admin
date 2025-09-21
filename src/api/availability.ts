import { apiClient } from "./client";
import type { AvailabilityParams, AvailabilityResponse } from "@/types";

export const getTurfAvailabilityQueryFn = async (
  turfId: string,
  params: AvailabilityParams,
): Promise<AvailabilityResponse> => {
  const response = await apiClient.get(`/turfs/${turfId}/availability`, {
    params,
  });
  return response.data;
};
