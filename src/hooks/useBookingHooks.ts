import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import {
  getTurfAvailabilityQueryFn,
  getUserBookingsQueryFn,
  getBookingDetailsQueryFn,
  getPaymentStatusQueryFn,
  calculateBookingPriceMutationFn,
  createBookingMutationFn,
  cancelBookingMutationFn,
  processPaymentMutationFn,
} from "../api";

// ==================== QUERY HOOKS ====================

/**
 * Hook to check turf availability for a specific date
 */
export const useTurfAvailability = (
  turfId: string,
  params: AvailabilityParams,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  },
) => {
  return useQuery<AvailabilityResponse, AxiosError<ApiError>>({
    queryKey: ["turf-availability", turfId, params],
    queryFn: () => getTurfAvailabilityQueryFn(turfId, params),
    enabled: options?.enabled !== false && !!turfId && !!params.date,
    refetchInterval: options?.refetchInterval,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get user's bookings with optional filters
 */
export const useUserBookings = (
  params: UserBookingsParams = {},
  options?: {
    enabled?: boolean;
  },
) => {
  return useQuery<UserBookingsResponse, AxiosError<ApiError>>({
    queryKey: ["user-bookings", params],
    queryFn: () => getUserBookingsQueryFn(turfId,params),
    enabled: options?.enabled !== false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to get detailed information about a specific booking
 */
export const useBookingDetails = (
  bookingId: string,
  options?: {
    enabled?: boolean;
  },
) => {
  return useQuery<BookingDetails, AxiosError<ApiError>>({
    queryKey: ["booking-details", bookingId],
    queryFn: () => getBookingDetailsQueryFn(bookingId),
    enabled: options?.enabled !== false && !!bookingId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook to get payment status for a booking
 */
export const usePaymentStatus = (
  bookingId: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  },
) => {
  return useQuery<PaymentStatusResponse, AxiosError<ApiError>>({
    queryKey: ["payment-status", bookingId],
    queryFn: () => getPaymentStatusQueryFn(bookingId),
    enabled: options?.enabled !== false && !!bookingId,
    refetchInterval: options?.refetchInterval,
    staleTime: 10 * 1000, // 10 seconds
  });
};

// ==================== MUTATION HOOKS ====================

/**
 * Hook to calculate booking price before confirming
 */
export const useCalculateBookingPrice = (options?: {
  onSuccess?: (data: CalculatePriceResponse) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation<
    CalculatePriceResponse,
    AxiosError<ApiError>,
    CalculatePriceRequest
  >({
    mutationFn: calculateBookingPriceMutationFn,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

/**
 * Hook to create a new booking
 */
export const useCreateBooking = (options?: {
  onSuccess?: (data: CreateBookingResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateBookingResponse,
    AxiosError<ApiError>,
    CreateBookingRequest
  >({
    mutationFn: createBookingMutationFn,
    onSuccess: (data) => {
      // Invalidate user bookings to reflect the new booking
      queryClient.invalidateQueries({
        queryKey: ["user-bookings"],
      });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to cancel a booking
 */
export const useCancelBooking = (options?: {
  onSuccess?: (data: CancelBookingResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<CancelBookingResponse, AxiosError<ApiError>, string>({
    mutationFn: cancelBookingMutationFn,
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ["user-bookings"],
      });
      queryClient.invalidateQueries({
        queryKey: ["booking-details", data.bookingId],
      });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to process payment for a booking
 */
export const useProcessPayment = (options?: {
  onSuccess?: (data: PaymentStatusResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<
    PaymentStatusResponse,
    AxiosError<ApiError>,
    { bookingId: string; request: ProcessPaymentRequest }
  >({
    mutationFn: ({
      bookingId,
      request,
    }: {
      bookingId: string;
      request: ProcessPaymentRequest;
    }) => processPaymentMutationFn(bookingId, request),
    onSuccess: (data) => {
      // Invalidate related queries to reflect payment status
      queryClient.invalidateQueries({
        queryKey: ["payment-status", data.bookingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["booking-details", data.bookingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-bookings"],
      });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

type AvailabilityParams = {
  date: string;
  startTime?: string;
  endTime?: string;
};

type AvailabilityResponse = {
  available: boolean;
  slots: Array<{ time: string; available: boolean }>;
};

type UserBookingsParams = {
  status?: string;
  page?: number;
  limit?: number;
};

type UserBookingsResponse = {
  bookings: Array<any>;
  pagination: { page: number; limit: number; total: number };
};

type BookingDetails = {
  id: string;
  turfId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  amount: number;
};

type PaymentStatusResponse = {
  bookingId: string;
  status: string;
  paymentId?: string;
};

type CalculatePriceResponse = {
  basePrice: number;
  taxes: number;
  totalPrice: number;
};

type CalculatePriceRequest = {
  turfId: string;
  date: string;
  startTime: string;
  endTime: string;
};

type CreateBookingResponse = {
  bookingId: string;
  status: string;
  paymentUrl?: string;
};

type CreateBookingRequest = {
  turfId: string;
  date: string;
  startTime: string;
  endTime: string;
  playerCount: number;
};

type CancelBookingResponse = {
  bookingId: string;
  status: string;
  refundAmount?: number;
};

type ProcessPaymentRequest = {
  paymentMethod: string;
  paymentDetails: any;
};

type ApiError = {
  message: string;
  code: string;
};
