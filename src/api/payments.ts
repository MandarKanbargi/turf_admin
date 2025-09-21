import { apiClient } from "./client";
import type {
  PaymentStatusResponse,
  ProcessPaymentRequest,
  ApiResponse,
} from "@/types";

/**
 * Get the payment status for a booking
 */
export const getPaymentStatusQueryFn = async (
  bookingId: string,
): Promise<PaymentStatusResponse> => {
  const response = await apiClient.get(`/payments/${bookingId}/status`, {
    withCredentials: true,
  });
  return response.data;
};

/**
 * Process payment for a booking
 */
export const processPaymentMutationFn = async (
  bookingId: string,
  request: ProcessPaymentRequest,
): Promise<PaymentStatusResponse> => {
  const response = await apiClient.post(
    `/payments/${bookingId}/process`,
    request,
    { withCredentials: true },
  );
  return response.data;
};
