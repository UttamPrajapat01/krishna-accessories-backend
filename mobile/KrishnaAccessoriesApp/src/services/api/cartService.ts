import apiClient from './apiClient';
import { ApiResponse, Cart } from '../../types';

export const cartService = {
  getCart: async (): Promise<Cart> => {
    const res = await apiClient.get<ApiResponse<Cart>>('/cart');
    return res.data.data;
  },

  addItem: async (productId: string, quantity: number = 1): Promise<Cart> => {
    const res = await apiClient.post<ApiResponse<Cart>>('/cart/items', { productId, quantity });
    return res.data.data;
  },

  updateItem: async (itemId: string, quantity: number): Promise<Cart> => {
    const res = await apiClient.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, { quantity });
    return res.data.data;
  },

  removeItem: async (itemId: string): Promise<Cart> => {
    const res = await apiClient.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`);
    return res.data.data;
  },

  clearCart: async (): Promise<boolean> => {
    const res = await apiClient.delete<ApiResponse<boolean>>('/cart');
    return res.data.data;
  }
};
