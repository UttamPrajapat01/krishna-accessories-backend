import apiClient from './apiClient';
import { ApiResponse, User } from '../../types';

export interface AuthResult {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export const authService = {
  login: async (email: string, password: string):Promise<AuthResult> => {
    const res = await apiClient.post<ApiResponse<AuthResult>>('/auth/login', { email, password });
    return res.data.data;
  },

  register: async (fullName: string, email: string, password: string, phoneNumber?: string): Promise<AuthResult> => {
    const res = await apiClient.post<ApiResponse<AuthResult>>('/auth/register', {
      fullName,
      email,
      password,
      phoneNumber
    });
    return res.data.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },

  logout: async (): Promise<boolean> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore API failure on logout
    }
    return true;
  }
};
