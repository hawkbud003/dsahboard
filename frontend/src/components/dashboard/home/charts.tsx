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
import { dashboardClient, PerformanceData, DistributionData, MetricsData } from '@/lib/DashboardClient';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-IN').format(value);
}

export function DashboardCharts() {
  const theme = useTheme();
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [statusData, setStatusData] = useState<DistributionData[]>([]);
  const [typeData, setTypeData] = useState<DistributionData[]>([]);
  const [metricsData, setMetricsData] = useState<MetricsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [performanceRes, statusRes, typeRes, metricsRes] = await Promise.all([
          dashboardClient.getCampaignPerformance(),
          dashboardClient.getCampaignStatusDistribution(),
          dashboardClient.getCampaignTypeDistribution(),
          dashboardClient.getCampaignMetrics()
        ]);

        setPerformanceData(performanceRes);
        setStatusData(statusRes);
        setTypeData(typeRes);
        setMetricsData(metricsRes);
        setError(null);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error('Error fetching dashboard data:', err);
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

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography color="error">{error}</Typography>
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

  return (
    <Grid container spacing={2}>
      {/* Campaign Performance Over Time */}
      <Grid xs={12} md={8}>
        <Card>
          <CardHeader title="Campaign Performance Over Time" />
          <CardContent>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis 
                    dataKey="month" 
                    {...axisStyle}
                    tick={{ ...axisStyle.tick, fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="left" 
                    {...axisStyle}
                    tick={{ ...axisStyle.tick, fontSize: 12 }}
                    tickFormatter={formatNumber}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    {...axisStyle}
                    tick={{ ...axisStyle.tick, fontSize: 12 }}
                    tickFormatter={formatCurrency}
                  />
                  <Tooltip 
                    contentStyle={tooltipStyle}
                    formatter={(value, name) => {
                      if (name === 'spend') return formatCurrency(value as number);
                      return formatNumber(value as number);
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 20 }} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="impressions"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                    name="Impressions"
                    strokeWidth={2}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="clicks"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.3}
                    name="Clicks"
                    strokeWidth={2}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="views"
                    stroke="#ffc658"
                    fill="#ffc658"
                    fillOpacity={0.3}
                    name="Views"
                    strokeWidth={2}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="spend"
                    stroke="#ff7300"
                    fill="#ff7300"
                    fillOpacity={0.3}
                    name="Spend"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Campaign Status Distribution */}
      <Grid xs={12} md={4}>
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

      {/* Campaign Type Distribution */}
      <Grid xs={12} md={6}>
        <Card>
          <CardHeader title="Campaign Type Distribution" />
          <CardContent>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ paddingTop: 20 }} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Campaign Performance Metrics */}
      <Grid xs={12} md={6}>
        <Card>
          <CardHeader title="Campaign Performance Metrics" />
          <CardContent>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metricsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis 
                    dataKey="month" 
                    {...axisStyle}
                    tick={{ ...axisStyle.tick, fontSize: 12 }}
                  />
                  <YAxis 
                    {...axisStyle}
                    tick={{ ...axisStyle.tick, fontSize: 12 }}
                    tickFormatter={formatNumber}
                  />
                  <Tooltip 
                    contentStyle={tooltipStyle}
                    formatter={(value, name) => {
                      if (name === 'CTR' || name === 'VTR') return `${value}%`;
                      return formatNumber(value as number);
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 20 }} />
                  <Bar dataKey="impressions" fill="#8884d8" name="Impressions" />
                  <Bar dataKey="clicks" fill="#82ca9d" name="Clicks" />
                  <Bar dataKey="views" fill="#ffc658" name="Views" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
