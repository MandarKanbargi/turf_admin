import { apiClient } from "./config";
import type { Pagination } from "@/types";
import type { NotificationsResponse, ApiResponse } from "@/types";


// ==================== QUERY FUNCTIONS ====================

/**
 * Get user notifications with pagination
 */
export const getNotificationsQueryFn = async (
  params: Pagination = { page: 1, limit: 20, total: 0, totalPages: 0 },
): Promise<NotificationsResponse> => {
  const response = await apiClient.get<ApiResponse<NotificationsResponse>>(
    "/notifications",
    { params },
  );
  return response.data.data;
};

// ==================== MUTATION FUNCTIONS ====================

/**
 * Mark a specific notification as read
 */
export const markNotificationAsReadMutationFn = async (
  notificationId: string,
): Promise<{ success: boolean }> => {
  const response = await apiClient.put<ApiResponse<{ success: boolean }>>(
    `/notifications/${notificationId}/read`,
  );
  return response.data.data;
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsReadMutationFn = async (): Promise<{
  success: boolean;
}> => {
  const response = await apiClient.put<ApiResponse<{ success: boolean }>>(
    "/notifications/read-all",
  );
  return response.data.data;
};
