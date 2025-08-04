import { HttpClient } from '../http/client';
import { httpClient } from '../index';

export interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
  loading: boolean;
}

export interface PaymentData {
  tier?: string;
  productType?: string;
}

export interface CheckoutResponse {
  url: string;
  session_id?: string;
}

class SubscriptionService {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  async checkSubscription(): Promise<SubscriptionStatus> {
    try {
      const response = await this.client.get<SubscriptionStatus>('/subscriptions/status');
      return response.data;
    } catch (error: any) {
      console.error('Failed to check subscription:', error);
      return { subscribed: false, loading: false };
    }
  }

  async createCheckout(tier: string): Promise<CheckoutResponse> {
    try {
      const response = await this.client.post<CheckoutResponse>('/subscriptions/checkout', { tier });
      return response.data;
    } catch (error: any) {
      console.error('Failed to create checkout:', error);
      throw new Error(error.response?.data?.error || 'Failed to create checkout session');
    }
  }

  async createPayment(productType: string): Promise<CheckoutResponse> {
    try {
      const response = await this.client.post<CheckoutResponse>('/payments/create', { productType });
      return response.data;
    } catch (error: any) {
      console.error('Failed to create payment:', error);
      throw new Error(error.response?.data?.error || 'Failed to create payment session');
    }
  }

  async openCustomerPortal(): Promise<{ url: string }> {
    try {
      const response = await this.client.post<{ url: string }>('/subscriptions/portal');
      return response.data;
    } catch (error: any) {
      console.error('Failed to open customer portal:', error);
      throw new Error(error.response?.data?.error || 'Failed to open customer portal');
    }
  }

  async getPaymentHistory(page: number = 1, limit: number = 50): Promise<{ orders: any[]; total: number }> {
    try {
      const response = await this.client.get<{ orders: any[]; total: number }>(
        `/payments/history?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to get payment history:', error);
      return { orders: [], total: 0 };
    }
  }

  async cancelSubscription(): Promise<boolean> {
    try {
      await this.client.post('/subscriptions/cancel');
      return true;
    } catch (error: any) {
      console.error('Failed to cancel subscription:', error);
      return false;
    }
  }

  async updateSubscription(newTier: string): Promise<boolean> {
    try {
      await this.client.put('/subscriptions/update', { tier: newTier });
      return true;
    } catch (error: any) {
      console.error('Failed to update subscription:', error);
      return false;
    }
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService(httpClient);
export { SubscriptionService };