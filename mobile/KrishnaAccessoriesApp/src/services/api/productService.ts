import apiClient from './apiClient';
import { ApiResponse, Product } from '../../types';

export interface ProductFilterParams {
  search?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  sortBy?: string;
  pageNumber?: number;
  pageSize?: number;
}

export const productService = {
  getProducts: async (params?: ProductFilterParams): Promise<{ items: Product[]; totalCount: number }> => {
    const res = await apiClient.get<ApiResponse<{ items: Product[]; totalCount: number }>>('/products', { params });
    return res.data.data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const res = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data.data;
  },

  getFeatured: async (count: number = 8): Promise<Product[]> => {
    const res = await apiClient.get<ApiResponse<Product[]>>('/products/featured', { params: { count } });
    return res.data.data;
  },

  getBestSellers: async (count: number = 8): Promise<Product[]> => {
    const res = await apiClient.get<ApiResponse<Product[]>>('/products/bestsellers', { params: { count } });
    return res.data.data;
  }
};
