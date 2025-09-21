import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import {
  getSportsQueryFn,
  getBookingTypesQueryFn,
  getAmenitiesQueryFn,
  getCitiesQueryFn,
  getStatesQueryFn,
} from "../api";

type Sport = {
  id: string;
  name: string;
  icon?: string;
};

type BookingType = {
  id: string;
  name: string;
  description: string;
};

type Amenity = {
  id: string;
  name: string;
  icon?: string;
};

type City = {
  id: string;
  name: string;
  stateId: string;
};

type State = {
  id: string;
  name: string;
  code: string;
};

type ApiError = {
  message: string;
  code: string;
};

// ==================== QUERY HOOKS ====================

/**
 * Hook to get all available sports
 * This data is relatively static and cached for a longer period
 */
export const useSports = (options?: { enabled?: boolean }) => {
  return useQuery<Sport[], AxiosError<ApiError>>({
    queryKey: ["sports"],
    queryFn: getSportsQueryFn,
    enabled: options?.enabled !== false,
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  });
};

/**
 * Hook to get all booking types
 * This data is relatively static and cached for a longer period
 */
export const useBookingTypes = (options?: { enabled?: boolean }) => {
  return useQuery<BookingType[], AxiosError<ApiError>>({
    queryKey: ["booking-types"],
    queryFn: getBookingTypesQueryFn,
    enabled: options?.enabled !== false,
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  });
};

/**
 * Hook to get all available amenities
 * This data is relatively static and cached for a longer period
 */
export const useAmenities = (options?: { enabled?: boolean }) => {
  return useQuery<Amenity[], AxiosError<ApiError>>({
    queryKey: ["amenities"],
    queryFn: getAmenitiesQueryFn,
    enabled: options?.enabled !== false,
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  });
};

/**
 * Hook to get all cities
 * This data is relatively static and cached for a longer period
 */
export const useCities = (options?: { enabled?: boolean }) => {
  return useQuery<City[], AxiosError<ApiError>>({
    queryKey: ["cities"],
    queryFn: getCitiesQueryFn,
    enabled: options?.enabled !== false,
    staleTime: 60 * 60 * 1000, // 1 hour
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

/**
 * Hook to get all states
 * This data is relatively static and cached for a longer period
 */
export const useStates = (options?: { enabled?: boolean }) => {
  return useQuery<State[], AxiosError<ApiError>>({
    queryKey: ["states"],
    queryFn: getStatesQueryFn,
    enabled: options?.enabled !== false,
    staleTime: 60 * 60 * 1000, // 1 hour
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};
