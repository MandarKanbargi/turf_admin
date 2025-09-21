import type {
  ApiResponse,
  AvailabilityResponse,
  AvailabilityParams,
} from "@/types";
// ✅ default import
import { apiClient } from "./api/client";

export const getTurfAvailabilityQueryFn = (
  turfId: string,
  params: AvailabilityParams,
) => {
  return apiClient.get<ApiResponse<AvailabilityResponse>>(
    `/turfs/${turfId}/availability`,
    { params },
  );
};

export const getUserBookingsQueryFn = async () => {
  throw new Error("API function not implemented");
};

export const getBookingDetailsQueryFn = async () => {
  throw new Error("API function not implemented");
};

export const getPaymentStatusQueryFn = async () => {
  throw new Error("API function not implemented");
};

export const calculateBookingPriceMutationFn = async () => {
  throw new Error("API function not implemented");
};

export const createBookingMutationFn = async () => {
  throw new Error("API function not implemented");
};

export const cancelBookingMutationFn = async () => {
  throw new Error("API function not implemented");
};

export const processPaymentMutationFn = async () => {
  throw new Error("API function not implemented");
};

export const getConnectPlayProfileQueryFn = async () => {
  throw new Error("API function not implemented");
};

export const getConnectPlayDirectoryQueryFn = async () => {
  throw new Error("API function not implemented");
};

export const createConnectPlayProfileMutationFn = async () => {
  throw new Error("API function not implemented");
};

export const updateConnectPlayProfileMutationFn = async () => {
  throw new Error("API function not implemented");
};

export const deleteConnectPlayProfileMutationFn = async () => {
  throw new Error("API function not implemented");
};

export const getContactMutationFn = async () => {
  throw new Error("API function not implemented");
};

export const logContactViewMutationFn = async () => {
  throw new Error("API function not implemented");
};

export const reportProfileMutationFn = async () => {
  throw new Error("API function not implemented");
};

export const updateProfileGameDetailsMutationFn = async () => {
  throw new Error("API function not implemented");
};

export const getSportsQueryFn = async () => {
  throw new Error("API function not implemented");
};

export const getBookingTypesQueryFn = async () => {
  throw new Error("API function not implemented");
};

export const getAmenitiesQueryFn = async () => {
  throw new Error("API function not implemented");
};

export const getCitiesQueryFn = async () => {
  throw new Error("API function not implemented");
};

export const getStatesQueryFn = async () => {
  throw new Error("API function not implemented");
};

export const getNotificationsQueryFn = async () => {
  throw new Error("API function not implemented");
};

export const markNotificationAsReadMutationFn = async () => {
  throw new Error("API function not implemented");
};

export const markAllNotificationsAsReadMutationFn = async () => {
  throw new Error("API function not implemented");
};

export const getTurfReviewsQueryFn = async () => {
  throw new Error("API function not implemented");
};

export const getUserReviewsQueryFn = async () => {
  throw new Error("API function not implemented");
};

export const createReviewMutationFn = async () => {
  throw new Error("API function not implemented");
};

export const markReviewHelpfulMutationFn = async () => {
  throw new Error("API function not implemented");
};

export const searchTurfsQueryFn = async () => {
  throw new Error("API function not implemented");
};

export const getTurfDetailsQueryFn = async () => {
  throw new Error("API function not implemented");
};
