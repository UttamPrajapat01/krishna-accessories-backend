import apiClient from './apiClient';
import { ApiResponse, NotificationItem } from '../../types';

export const notificationService = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    const res = await apiClient.get<ApiResponse<NotificationItem[]>>('/notifications');
    return res.data.data;
  },

  markAsRead: async (id: string): Promise<boolean> => {
    const res = await apiClient.put<ApiResponse<boolean>>(`/notifications/${id}/read`);
    return res.data.data;
  }
};
