import { Box, Grid, Typography } from '@mui/material';
import { Image, Video } from '@phosphor-icons/react';
import { SectionContainer } from '../../layout/section-container';
import { TypeSelector } from '../../layout/type-selector';

const campaignTypes = [
  { id: 'Banner', label: 'Banner', icon: Image },
  { id: 'Video', label: 'Video', icon: Video },
];

export const CampaignType = ({ campaignType, setCampaignType, setValue,errors }: any) => {
  return (
    <SectionContainer title="Campaign Type">
     <Grid item xs={12}>
        <TypeSelector
          name="objective"
          selectedType={campaignType}
          setSelectedType={setCampaignType}
          setValue={setValue}
          options={campaignTypes}
        />
        <Typography variant="caption" color="error.main">
          {errors.objective?.message}
        </Typography>
      </Grid>
    </SectionContainer>
  );
};





