import apiClient from './apiClient';
import { ApiResponse, Wishlist } from '../../types';

export const wishlistService = {
  getWishlist: async (): Promise<Wishlist> => {
    const res = await apiClient.get<ApiResponse<Wishlist>>('/wishlist');
    return res.data.data;
  },

  add: async (productId: string): Promise<boolean> => {
    const res = await apiClient.post<ApiResponse<boolean>>(`/wishlist/${productId}`);
    return res.data.data;
  },

  remove: async (productId: string): Promise<boolean> => {
    const res = await apiClient.delete<ApiResponse<boolean>>(`/wishlist/${productId}`);
    return res.data.data;
  }
};
