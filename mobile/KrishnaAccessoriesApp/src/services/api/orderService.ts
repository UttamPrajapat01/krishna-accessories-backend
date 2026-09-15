import apiClient from './apiClient';
import { ApiResponse, Order } from '../../types';

export const orderService = {
  createOrder: async (addressId: string, paymentMethod: string, notes?: string, couponCode?: string): Promise<Order> => {
    const res = await apiClient.post<ApiResponse<Order>>('/orders', {
      addressId,
      paymentMethod,
      notes,
      couponCode
    });
    return res.data.data;
  },

  getUserOrders: async (page: number = 1, pageSize: number = 10): Promise<{ items: Order[]; totalCount: number }> => {
    const res = await apiClient.get<ApiResponse<{ items: Order[]; totalCount: number }>>('/orders', {
      params: { page, pageSize }
    });
    return res.data.data;
  },

  getOrderById: async (id: string): Promise<Order> => {
    const res = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return res.data.data;
  },

  cancelOrder: async (id: string): Promise<boolean> => {
    const res = await apiClient.post<ApiResponse<boolean>>(`/orders/${id}/cancel`);
    return res.data.data;
  }
};
