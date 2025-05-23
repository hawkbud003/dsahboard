import axiosInstance from './axios-instance';

export interface PerformanceData {
  month: string;
  impressions: number;
  clicks: number;
  views: number;
  spend: number;
}

export interface DistributionData {
  name: string;
  value: number;
}

export interface MetricsData {
  month: string;
  impressions: number;
  clicks: number;
  views: number;
  ctr: number;
  vtr: number;
}

class DashboardClient {
  async getCampaignPerformance(): Promise<PerformanceData[]> {
    const response = await axiosInstance.get<PerformanceData[]>('/dashboard/performance/');
    return response.data;
  }

  async getCampaignStatusDistribution(): Promise<DistributionData[]> {
    const response = await axiosInstance.get<DistributionData[]>('/dashboard/status-distribution/');
    return response.data;
  }

  async getCampaignTypeDistribution(): Promise<DistributionData[]> {
    const response = await axiosInstance.get<DistributionData[]>('/dashboard/type-distribution/');
    return response.data;
  }

  async getCampaignMetrics(): Promise<MetricsData[]> {
    const response = await axiosInstance.get<MetricsData[]>('/dashboard/metrics/');
    return response.data;
  }
}

export const dashboardClient = new DashboardClient(); 