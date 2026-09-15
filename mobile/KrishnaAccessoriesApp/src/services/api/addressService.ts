import apiClient from './apiClient';
import { Address, ApiResponse } from '../../types';

export const addressService = {
  getAddresses: async (): Promise<Address[]> => {
    const res = await apiClient.get<ApiResponse<Address[]>>('/addresses');
    return res.data.data;
  },

  create: async (data: Omit<Address, 'id'>): Promise<Address> => {
    const res = await apiClient.post<ApiResponse<Address>>('/addresses', data);
    return res.data.data;
  },

  update: async (id: string, data: Omit<Address, 'id'>): Promise<Address> => {
    const res = await apiClient.put<ApiResponse<Address>>(`/addresses/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<boolean> => {
    const res = await apiClient.delete<ApiResponse<boolean>>(`/addresses/${id}`);
    return res.data.data;
  },

  setDefault: async (id: string): Promise<boolean> => {
    const res = await apiClient.put<ApiResponse<boolean>>(`/addresses/${id}/default`);
    return res.data.data;
  }
};
