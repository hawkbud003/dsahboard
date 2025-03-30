"use client"
import CreateCampaign from '@/components/dashboard/campaign/create-campaign';
import BackBtn from '@/components/dashboard/layout/back-btn';
import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';


export default function CreateCampaignPage(): React.JSX.Element {

  return (
    <Box>
      <BackBtn/>
      <Box mb={2}>
      <Typography mb={5} variant="h4">Create Campaign</Typography>
        <CreateCampaign/>
      </Box>
    </Box>
  );
}
