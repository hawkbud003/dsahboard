'use client';

import { Card, CardContent, Typography, Box } from '@mui/material';
import { TrendingUp, Campaign, Visibility, TrendingDown } from '@mui/icons-material';
import Grid from '@mui/material/Unstable_Grid2';

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

export function MetricTiles() {
  // TODO: Replace with actual data from API
  const metrics = [
    {
      title: 'Total Campaigns',
      value: '24',
      icon: <Campaign sx={{ color: 'white' }} />
    },
    {
      title: 'Total Spend',
      value: '$45,231',
      icon: <TrendingUp sx={{ color: 'white' }} />
    },
    {
      title: 'Total Impressions',
      value: '1.2M',
      icon: <Visibility sx={{ color: 'white' }} />
    },
    {
      title: 'Total Clicks',
      value: '3.5M',
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
