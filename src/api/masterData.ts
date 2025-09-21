import { apiClient } from "./config";
import type { NotificationsResponse, ApiResponse } from "@/types";
import type { BookingType, Sport, State, Amenity, City } from "@/types";

export const getSportsQueryFn = async (): Promise<Sport[]> => {
  const response = await apiClient.get<ApiResponse<Sport[]>>("/sports");
  return response.data.data;
};

/**
 * Get all booking types
 */
export const getBookingTypesQueryFn = async (): Promise<BookingType[]> => {
  const response =
    await apiClient.get<ApiResponse<BookingType[]>>("/booking-types");
  return response.data.data;
};

/**
 * Get all available amenities
 */
export const getAmenitiesQueryFn = async (): Promise<Amenity[]> => {
  const response = await apiClient.get<ApiResponse<Amenity[]>>("/amenities");
  return response.data.data;
};

/**
 * Get all cities
 */
export const getCitiesQueryFn = async (): Promise<City[]> => {
  const response =
    await apiClient.get<ApiResponse<City[]>>("/locations/cities");
  return response.data.data;
};

/**
 * Get all states
 */
export const getStatesQueryFn = async (): Promise<State[]> => {
  const response =
    await apiClient.get<ApiResponse<State[]>>("/locations/states");
  return response.data.data;
};
