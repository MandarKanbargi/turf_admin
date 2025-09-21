import { apiClient } from "./client";
import type {
  AvailabilityResponse,
  ApiResponse,
  AvailabilityParams,
  CalculatePriceRequest,
  CalculatePriceResponse,
  CreateBookingRequest,
  UserBookingsResponse,
  CreateBookingResponse,
  UserBookingsParams,
} from "@/types";

/**
 * Check turf availability for a specific date
 */
export const checkTurfAvailability = async (
  turfId: string,
  params: AvailabilityParams,
): Promise<ApiResponse<AvailabilityResponse>> => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });

  return (
    await apiClient.get(
      `/turfs/${turfId}/availability?${searchParams.toString()}`,
    )
  ).data;
};

/**
 * Calculate booking price before creating booking
 */
export const calculateBookingPrice = async (
  data: CalculatePriceRequest,
): Promise<ApiResponse<CalculatePriceResponse>> => {
  return (await apiClient.post("/bookings/calculate-price", data)).data;
};

/**
 * Create a new booking
 */
export const createBooking = async (
  data: CreateBookingRequest,
): Promise<ApiResponse<CreateBookingResponse>> => {
  return (await apiClient.post("/bookings", data, { withCredentials: true }))
    .data;
};

/**
 * Get user's bookings with filters
 */
export const getUserBookings = async (
  params: UserBookingsParams = {},
): Promise<ApiResponse<UserBookingsResponse>> => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });

  return (
    await apiClient.get(`/bookings/my-bookings?${searchParams.toString()}`, {
      withCredentials: true,
    })
  ).data;
};

export const getUserBookingsQueryFn = async (params: UserBookingsParams) => {
  return apiClient.get("/bookings", { params }).then((res) => res.data);
};

export const getBookingDetailsQueryFn = async (bookingId: string) => {
  return apiClient.get(`/bookings/${bookingId}`).then((res) => res.data);
};

export const createBookingMutationFn = async (data: CreateBookingRequest) => {
  return apiClient.post("/bookings", data).then((res) => res.data);
};

export const cancelBookingMutationFn = async (bookingId: string) => {
  return apiClient.delete(`/bookings/${bookingId}`).then((res) => res.data);
};
