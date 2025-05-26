'use client';

import { ProfileFormData, UpdatePasswordParams, User } from '@/types/auth';
import axiosInstance from './axios-instance';
import { utils } from './CommonUtils';

interface DashboardTilesResponse {
  message: string;
  data: {
    total_impressions: number;
    total_clicks: number;
    total_spend: number;
    campaign_count: number;
  };
  success: boolean;
}

interface DashboardChartsResponse {
  message: string;
  data: {
    campaign_status_distribution: Array<{
      status: string;
      count: number;
    }>;
    objective_distribution: Array<{
      objective: string;
      count: number;
    }>;
    spend_by_buy_type: Array<{
      buy_type: string;
      total_spend: number;
    }>;
    campaign_performance_summary: {
      total_impressions: number;
      total_clicks: number;
      total_views: number;
      total_spend: number;
      average_ctr: number;
    };
    top_campaigns_by_ctr: Array<{
      name: string;
      ctr: number;
    }>;
  };
  success: boolean;
}

class AccountClient {

    async getUser(): Promise<User> {
      try {
        const response = await axiosInstance.get('/api/profile/', {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data.data;
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }

    async updateUser(user: ProfileFormData): Promise<User> {
      try {
        const response = await axiosInstance.put('/api/user/update/', user, {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }

    async updatePassword(password:UpdatePasswordParams): Promise<boolean> {
      try {
        await axiosInstance.put('/api/user/change-password/', password, {
          headers: { 'Content-Type': 'application/json' },
        });
        return true;
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }

    async getDashboardTiles(): Promise<DashboardTilesResponse> {
      try {
        const response = await axiosInstance.get('/dashboard/tiles/', {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }

    async getDashboardCharts(): Promise<DashboardChartsResponse> {
      try {
        const response = await axiosInstance.get('/dashboard/charts/', {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }
}

export const accountClient = new AccountClient();
