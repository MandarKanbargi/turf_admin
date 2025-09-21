import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { searchTurfsQueryFn, getTurfDetailsQueryFn } from "../api";

// ==================== QUERY HOOKS ====================

type TurfSearchParams = {
  location?: string;
  sport?: string;
  date?: string;
  priceRange?: [number, number];
  amenities?: string[];
  page?: number;
  limit?: number;
};

type TurfSearchResponse = {
  turfs: TurfDetails[];
  pagination: { page: number; limit: number; total: number };
  filters: any;
};

type TurfDetails = {
  id: string;
  name: string;
  location: string;
  sports: string[];
  amenities: string[];
  pricePerHour: number;
  rating: number;
  images: string[];
  description: string;
};

type ApiError = {
  message: string;
  code: string;
};

/**
 * Hook to search turfs with filters
 */
export const useSearchTurfs = (
  params: TurfSearchParams = {},
  options?: {
    enabled?: boolean;
    keepPreviousData?: boolean;
  },
) => {
  return useQuery<TurfSearchResponse, AxiosError<ApiError>>({
    queryKey: ["search-turfs", params],
    queryFn: () => searchTurfsQueryFn(params),
    enabled: options?.enabled !== false,
    placeholderData: options?.keepPreviousData
      ? (previousData: any) => previousData
      : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get detailed information about a specific turf
 */
export const useTurfDetails = (
  turfId: string,
  options?: {
    enabled?: boolean;
  },
) => {
  return useQuery<TurfDetails, AxiosError<ApiError>>({
    queryKey: ["turf-details", turfId],
    queryFn: () => getTurfDetailsQueryFn(turfId),
    enabled: options?.enabled !== false && !!turfId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Added missing exports;
