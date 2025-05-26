'use client';

import { Card, CardContent, CardHeader, Typography, Box, CircularProgress, useTheme } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useEffect, useState } from 'react';
import { accountClient } from '@/lib/AccountClient';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface DashboardChartsData {
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
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(value);
}

function formatPercentage(value: number) {
  return `${value.toFixed(2)}%`;
}

export function DashboardCharts() {
  const theme = useTheme();
  const [data, setData] = useState<DashboardChartsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching dashboard charts data...');
        
        const response = await accountClient.getDashboardCharts();
        console.log('Raw API Response:', response);

        if (!response) {
          throw new Error('No response received from the API');
        }

        if (!response.success) {
          throw new Error(response.message || 'API request was not successful');
        }

        if (!response.data) {
          throw new Error('No data received from the API');
        }

        // Validate the data structure
        const requiredFields = [
          'campaign_status_distribution',
          'objective_distribution',
          'spend_by_buy_type',
          'campaign_performance_summary',
          'top_campaigns_by_ctr'
        ] as const;

        const missingFields = requiredFields.filter(field => !response.data[field]);
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        setData(response.data);
        console.log('Processed Data:', response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          response: err.response
        });
        
        // Handle specific error cases
        if (err.message.includes('Could not establish connection')) {
          setError('Unable to connect to the server. Please check your internet connection and try again.');
        } else if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else if (err.response?.status === 403) {
          setError('You do not have permission to access this data.');
        } else {
          setError(err.message || 'Failed to fetch dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography color="error">
          {error || 'No data available'}
          {error && (
            <Box component="pre" sx={{ mt: 2, fontSize: '0.875rem', color: 'text.secondary' }}>
              {error}
            </Box>
          )}
        </Typography>
      </Box>
    );
  }

  const axisStyle = {
    tick: { fill: theme.palette.text.secondary },
    axisLine: { stroke: theme.palette.divider },
    tickLine: { stroke: theme.palette.divider }
  };

  const tooltipStyle = {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1)
  };

  // Transform data for pie charts
  const statusData = data.campaign_status_distribution.map(item => ({
    name: item.status,
    value: item.count
  }));

  const objectiveData = data.objective_distribution.map(item => ({
    name: item.objective,
    value: item.count
  }));

  console.log('Transformed Status Data:', statusData);
  console.log('Transformed Objective Data:', objectiveData);

  return (
    <Grid container spacing={2}>
       {/* Top Campaigns by CTR */}
       <Grid xs={12} md={6}>
        <Card>
          <CardHeader title="Top Campaigns by CTR" />
          <CardContent>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={data.top_campaigns_by_ctr} 
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 100, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis 
                    type="number"
                    {...axisStyle}
                    tick={{ ...axisStyle.tick, fontSize: 12 }}
                    tickFormatter={formatPercentage}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    {...axisStyle}
                    tick={{ ...axisStyle.tick, fontSize: 12 }}
                    width={100}
                  />
                  <Tooltip 
                    contentStyle={tooltipStyle}
                    formatter={(value) => formatPercentage(value as number)}
                  />
                  <Legend wrapperStyle={{ paddingTop: 10 }} />
                  <Bar dataKey="ctr" fill="#82ca9d" name="CTR" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Campaign Status Distribution */}
      <Grid xs={12} md={6}>
        <Card>
          <CardHeader title="Campaign Status Distribution" />
          <CardContent>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ paddingTop: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Objective Distribution */}
      <Grid xs={12} md={6}>
        <Card>
          <CardHeader title="Objective Distribution" />
          <CardContent>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={objectiveData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {objectiveData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ paddingTop: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Spend by Buy Type */}
      <Grid xs={12} md={6}>
        <Card>
          <CardHeader title="Spend by Buy Type" />
          <CardContent>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.spend_by_buy_type} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis 
                    dataKey="buy_type" 
                    {...axisStyle}
                    tick={{ ...axisStyle.tick, fontSize: 12 }}
                  />
                  <YAxis 
                    {...axisStyle}
                    tick={{ ...axisStyle.tick, fontSize: 12 }}
                    tickFormatter={formatCurrency}
                  />
                  <Tooltip 
                    contentStyle={tooltipStyle}
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Legend wrapperStyle={{ paddingTop: 10 }} />
                  <Bar dataKey="total_spend" fill="#8884d8" name="Total Spend" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

     
      {/* Campaign Performance Summary */}
      <Grid xs={12}>
        <Card>
          <CardHeader title="Campaign Performance Summary" />
          <CardContent>
            <Grid container spacing={3}>
              <Grid xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="text.secondary">Total Impressions</Typography>
                <Typography variant="h4">{formatNumber(data.campaign_performance_summary.total_impressions)}</Typography>
              </Grid>
              <Grid xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="text.secondary">Total Clicks</Typography>
                <Typography variant="h4">{formatNumber(data.campaign_performance_summary.total_clicks)}</Typography>
              </Grid>
              <Grid xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="text.secondary">Total Views</Typography>
                <Typography variant="h4">{formatNumber(data.campaign_performance_summary.total_views)}</Typography>
              </Grid>
              <Grid xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="text.secondary">Total Spend</Typography>
                <Typography variant="h4">{formatCurrency(data.campaign_performance_summary.total_spend)}</Typography>
              </Grid>
              <Grid xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Average CTR</Typography>
                <Typography variant="h4">{formatPercentage(data.campaign_performance_summary.average_ctr)}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
