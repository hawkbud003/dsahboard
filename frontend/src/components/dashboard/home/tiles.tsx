'use client';

import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { TrendingUp, Campaign, Visibility, TrendingDown } from '@mui/icons-material';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { accountClient } from '@/lib/AccountClient';

interface MetricTileProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
}

function MetricTile({ title, value, icon, trend }: MetricTileProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            backgroundColor: 'primary.main', 
            borderRadius: 1, 
            p: 1, 
            display: 'flex', 
            alignItems: 'center',
            mr: 2
          }}>
            {icon}
          </Box>
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

interface DashboardData {
  total_impressions: number;
  total_clicks: number;
  total_spend: number;
  campaign_count: number;
}

export function MetricTiles() {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await accountClient.getDashboardTiles();
        if (response.success) {
          setData(response.data);
        } else {
          setError('Failed to fetch dashboard data');
        }
      } catch (err) {
        setError('Error fetching dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const metrics = [
    {
      title: 'Total Campaigns',
      value: data?.campaign_count || 0,
      icon: <Campaign sx={{ color: 'white' }} />
    },
    {
      title: 'Total Spend',
      value: `₹${data?.total_spend.toLocaleString() || 0}`,
      icon: <TrendingUp sx={{ color: 'white' }} />
    },
    {
      title: 'Total Impressions',
      value: data?.total_impressions.toLocaleString() || 0,
      icon: <Visibility sx={{ color: 'white' }} />
    },
    {
      title: 'Total Clicks',
      value: data?.total_clicks.toLocaleString() || 0,
      icon: <TrendingUp sx={{ color: 'white' }} />
    }
  ];

  return (
    <Grid container spacing={3}>
      {metrics.map((metric, index) => (
        <Grid xs={12} sm={6} md={3} key={index}>
          <MetricTile {...metric} />
        </Grid>
      ))}
    </Grid>
  );
}
