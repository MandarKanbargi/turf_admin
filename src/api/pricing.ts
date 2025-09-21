import { apiClient } from "./client";
import type {
  CalculatePriceRequest,
  CalculatePriceResponse,
  ApiResponse,
} from "@/types";

/**
 * Calculate the price of a booking based on request params
 */
export const calculateBookingPriceMutationFn = async (
  data: CalculatePriceRequest,
): Promise<CalculatePriceResponse> => {
  const response = await apiClient.post("/bookings/calculate-price", data, {
    withCredentials: true,
  });
  return response.data;
};
