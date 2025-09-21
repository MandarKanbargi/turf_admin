import {
  useQuery,
  keepPreviousData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { type AxiosError } from "axios";
import {
  getNotificationsQueryFn,
  markNotificationAsReadMutationFn,
  markAllNotificationsAsReadMutationFn,
} from "../api";

// ==================== QUERY HOOKS ====================

/**
 * Hook to get user notifications with pagination
 */
export const useNotifications = (
  params: Pagination = { page: 1, limit: 20, total: 0, totalPages: 0 },
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
    keepPreviousData?: boolean;
  },
) => {
  return useQuery<NotificationsResponse, AxiosError<ApiError>>({
    queryKey: ["notifications", params],
    queryFn: () => getNotificationsQueryFn(params),
    enabled: options?.enabled !== false,
    refetchInterval: options?.refetchInterval,
    placeholderData: options?.keepPreviousData ? keepPreviousData : undefined,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// ==================== MUTATION HOOKS ====================

/**
 * Hook to mark a specific notification as read
 */
export const useMarkNotificationAsRead = (options?: {
  onSuccess?: (data: { success: boolean }) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, AxiosError<ApiError>, string>({
    mutationFn: markNotificationAsReadMutationFn,
    onSuccess: (data, notificationId) => {
      // Update the notifications cache to mark the specific notification as read
      queryClient.setQueriesData(
        { queryKey: ["notifications"] },
        (old: NotificationsResponse | undefined) => {
          if (!old) return old;

          return {
            ...old,
            notifications: old.notifications.map((notification) =>
              notification.id === notificationId
                ? { ...notification, isRead: true }
                : notification,
            ),
            unreadCount: Math.max(0, old.unreadCount - 1),
          };
        },
      );
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

/**
 * Hook to mark all notifications as read
 */
export const useMarkAllNotificationsAsRead = (options?: {
  onSuccess?: (data: { success: boolean }) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, AxiosError<ApiError>>({
    mutationFn: markAllNotificationsAsReadMutationFn,
    onSuccess: (data) => {
      // Update the notifications cache to mark all notifications as read
      queryClient.setQueriesData(
        { queryKey: ["notifications"] },
        (old: NotificationsResponse | undefined) => {
          if (!old) return old;

          return {
            ...old,
            notifications: old.notifications.map((notification) => ({
              ...notification,
              isRead: true,
            })),
            unreadCount: 0,
          };
        },
      );
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};
