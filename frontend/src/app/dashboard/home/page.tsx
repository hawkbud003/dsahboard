import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import type { Metadata } from 'next';
import * as React from 'react';

import { config } from '@/config';
import { MetricTiles } from '@/components/dashboard/home/tiles';
import { DashboardCharts } from '@/components/dashboard/home/charts';

export const metadata = { title: `Home | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Welcome to Ominify</Typography>
      </div>
      
      {/* Metric Tiles */}
      <MetricTiles />
      
      {/* Charts */}
      <DashboardCharts />
    </Stack>
  );
}
