import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import type { Metadata } from 'next';
import * as React from 'react';

import { AccountDetailsForm } from '@/components/dashboard/account/account-details-form';
import { UpdatePasswordForm } from '@/components/dashboard/account/update-password-form';
import { config } from '@/config';

export const metadata = { title: `Account | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Account</Typography>
      </div>
      <Grid container spacing={3}>
        <Grid lg={8} md={6} xs={12}>
          <AccountDetailsForm />
          <div style={{ marginBottom: '1rem' }} />
          <UpdatePasswordForm />
        </Grid>
      </Grid>
    </Stack>
  );
}
