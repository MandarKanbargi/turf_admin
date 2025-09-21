import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import {
  getConnectPlayProfileQueryFn,
  getConnectPlayDirectoryQueryFn,
  createConnectPlayProfileMutationFn,
  updateConnectPlayProfileMutationFn,
  deleteConnectPlayProfileMutationFn,
  getContactMutationFn,
  logContactViewMutationFn,
  reportProfileMutationFn,
  updateProfileGameDetailsMutationFn,
} from "../api";

type ConnectPlayProfile = {
  id: string;
  userId: string;
  displayName: string;
  sports: string[];
  location: string;
  availability: string;
};

type ConnectPlayDirectoryParams = {
  sport?: string;
  location?: string;
  page?: number;
  limit?: number;
};

type ConnectPlayDirectoryResponse = {
  profiles: ConnectPlayProfile[];
  pagination: { page: number; limit: number; total: number };
};

type CreateConnectPlayProfileResponse = {
  profile: ConnectPlayProfile;
};

type CreateConnectPlayProfileRequest = {
  displayName: string;
  sports: string[];
  location: string;
  availability: string;
};

type UpdateConnectPlayProfileRequest = {
  displayName?: string;
  sports?: string[];
  location?: string;
  availability?: string;
};

type GetContactResponse = {
  contact: {
    name: string;
    phone: string;
    email: string;
  };
};

type GetContactRequest = {
  profileId: string;
};

type LogContactViewRequest = {
  profileId: string;
};

type ReportProfileResponse = {
  success: boolean;
};

type ReportProfileRequest = {
  profileId: string;
  reason: string;
  description?: string;
};

type UpdateProfileGameDetailsResponse = {
  success: boolean;
};

type UpdateProfileGameDetailsRequest = {
  gameDetails: any;
};

type ApiError = {
  message: string;
  code: string;
};

// ==================== QUERY HOOKS ====================

/**
 * Hook to get current user's Connect & Play profile
 */
export const useConnectPlayProfile = (options?: { enabled?: boolean }) => {
  return useQuery<ConnectPlayProfile, AxiosError<ApiError>>({
    queryKey: ["connect-play-profile"],
    queryFn: getConnectPlayProfileQueryFn,
    enabled: options?.enabled !== false,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if profile doesn't exist (404)
      if (error?.response?.status === 404) return false;
      return failureCount < 3;
    },
  });
};

/**
 * Hook to get Connect & Play directory with filters
 */
export const useConnectPlayDirectory = (
  params: ConnectPlayDirectoryParams = {},
  options?: {
    enabled?: boolean;
    keepPreviousData?: boolean;
  },
) => {
  return useQuery<ConnectPlayDirectoryResponse, AxiosError<ApiError>>({
    queryKey: ["connect-play-directory", params],
    queryFn: () => getConnectPlayDirectoryQueryFn(params),
    enabled: options?.enabled !== false,
    placeholderData: options?.keepPreviousData
      ? (previousData: any) => previousData
      : undefined,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

// ==================== MUTATION HOOKS ====================

/**
 * Hook to create Connect & Play profile
 */
export const useCreateConnectPlayProfile = (options?: {
  onSuccess?: (data: CreateConnectPlayProfileResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateConnectPlayProfileResponse,
    AxiosError<ApiError>,
    CreateConnectPlayProfileRequest
  >({
    mutationFn: createConnectPlayProfileMutationFn,
    onSuccess: (data) => {
      // Invalidate profile query to refetch the new profile
      queryClient.invalidateQueries({
        queryKey: ["connect-play-profile"],
      });
      // Invalidate directory to show the new profile
      queryClient.invalidateQueries({
        queryKey: ["connect-play-directory"],
      });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to update Connect & Play profile
 */
export const useUpdateConnectPlayProfile = (options?: {
  onSuccess?: (data: ConnectPlayProfile) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<
    ConnectPlayProfile,
    AxiosError<ApiError>,
    UpdateConnectPlayProfileRequest
  >({
    mutationFn: updateConnectPlayProfileMutationFn,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["connect-play-profile"] });
      // Invalidate directory to reflect changes
      queryClient.invalidateQueries({
        queryKey: ["connect-play-directory"],
      });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to delete Connect & Play profile
 */
export const useDeleteConnectPlayProfile = (options?: {
  onSuccess?: (data: { success: boolean }) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, AxiosError<ApiError>>({
    mutationFn: deleteConnectPlayProfileMutationFn,
    onSuccess: (data) => {
      // Remove profile from cache
      queryClient.removeQueries({
        queryKey: ["connect-play-profile"],
      });
      // Invalidate directory
      queryClient.invalidateQueries({
        queryKey: ["connect-play-directory"],
      });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to get contact information for a team
 */
export const useGetContact = (options?: {
  onSuccess?: (data: GetContactResponse) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation<
    GetContactResponse,
    AxiosError<ApiError>,
    GetContactRequest
  >({
    mutationFn: getContactMutationFn,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

/**
 * Hook to log contact view
 */
export const useLogContactView = (options?: {
  onSuccess?: (data: { success: boolean }) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation<
    { success: boolean },
    AxiosError<ApiError>,
    LogContactViewRequest
  >({
    mutationFn: logContactViewMutationFn,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

/**
 * Hook to report a profile
 */
export const useReportProfile = (options?: {
  onSuccess?: (data: ReportProfileResponse) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation<
    ReportProfileResponse,
    AxiosError<ApiError>,
    ReportProfileRequest
  >({
    mutationFn: reportProfileMutationFn,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

/**
 * Hook to update profile with selected game details
 */
export const useUpdateProfileGameDetails = (options?: {
  onSuccess?: (data: UpdateProfileGameDetailsResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateProfileGameDetailsResponse,
    AxiosError<ApiError>,
    UpdateProfileGameDetailsRequest
  >({
    mutationFn: updateProfileGameDetailsMutationFn,
    onSuccess: (data) => {
      // Update profile cache with new game details
      queryClient.invalidateQueries({
        queryKey: ["connect-play-profile"],
      });
      // Invalidate directory to reflect updated game details
      queryClient.invalidateQueries({
        queryKey: ["connect-play-directory"],
      });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};
