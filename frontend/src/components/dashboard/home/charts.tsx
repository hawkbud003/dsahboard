'use client';

import { Card, CardContent, CardHeader, Typography, Box } from '@mui/material';
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
  Cell
} from 'recharts';

// Mock data for charts
const performanceData = [
  { month: 'Jan', spend: 4000, views: 2400 },
  { month: 'Feb', spend: 3000, views: 1398 },
  { month: 'Mar', spend: 2000, views: 9800 },
  { month: 'Apr', spend: 2780, views: 3908 },
  { month: 'May', spend: 1890, views: 4800 },
  { month: 'Jun', spend: 2390, views: 3800 },
];

const campaignDistribution = [
  { name: 'Social Media', value: 400 },
  { name: 'Search', value: 300 },
  { name: 'Display', value: 300 },
  { name: 'Video', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function DashboardCharts() {
  return (
    <Grid container spacing={3}>
      {/* Performance Over Time Chart */}
      <Grid xs={12} md={8}>
        <Card>
          <CardHeader title="Performance Over Time" />
          <CardContent>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="spend"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                    name="Spend"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="views"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.3}
                    name="Views"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Campaign Distribution Chart */}
      <Grid xs={12} md={4}>
        <Card>
          <CardHeader title="Campaign Distribution" />
          <CardContent>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={campaignDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {campaignDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Monthly Performance Chart */}
      <Grid xs={12}>
        <Card>
          <CardHeader title="Monthly Performance" />
          <CardContent>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={formatCurrency} />
                  <Bar dataKey="spend" fill="#8884d8" name="Spend" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
