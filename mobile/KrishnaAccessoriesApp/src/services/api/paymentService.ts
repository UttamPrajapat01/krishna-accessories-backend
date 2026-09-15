import apiClient from './apiClient';
import { ApiResponse } from '../../types';

export interface RazorpayOrderInfo {
  orderId: string;
  orderNumber: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export const paymentService = {
  createRazorpayOrder: async (orderId: string): Promise<RazorpayOrderInfo> => {
    const res = await apiClient.post<ApiResponse<RazorpayOrderInfo>>(`/payments/create-razorpay-order/${orderId}`);
    return res.data.data;
  },

  verifyPayment: async (orderId: string, razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): Promise<boolean> => {
    const res = await apiClient.post<ApiResponse<boolean>>('/payments/verify', {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });
    return res.data.data;
  }
};
