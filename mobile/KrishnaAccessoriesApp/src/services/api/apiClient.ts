import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import Constants from 'expo-constants';

// Priority:
// 1. Production Environment Variable: EXPO_PUBLIC_API_URL (injected via .env or EAS Secrets)
// 2. app.json extra.apiBaseUrl (if not localhost)
// 3. Local emulator fallback
const getBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  const extraUrl = Constants.expoConfig?.extra?.apiBaseUrl;
  if (extraUrl && !extraUrl.includes('localhost') && !extraUrl.includes('127.0.0.1')) {
    return extraUrl;
  }
  return Platform.OS === 'android'
    ? 'http://10.0.2.2:5070/api'
    : 'http://localhost:5070/api';
};

export const API_BASE_URL = getBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('user_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('user_token');
      await AsyncStorage.removeItem('user_profile');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
