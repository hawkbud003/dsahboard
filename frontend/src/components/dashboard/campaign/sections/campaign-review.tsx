// ReviewSection.tsx
import { utils } from '@/lib/CommonUtils';
import { Grid } from '@mui/material';
import { DetailGrid, DetailRow, SectionContainer } from '../../layout/section-container';
import TargetType from '../../layout/target-type';

interface ReviewSectionProps {
  title: string;
  targetType: string;
  dataSources: any;
  getValues: any;
}

const reviewFields = [
  { label: "CampaignName", name: "name" },
  { label: "CampaignType", name: "objective" },
  { label: "Start Time", name: "start_time" },
  { label: "End Time", name: "end_time" },
  { label: "Locations", name: "location" },
  { label: "AgeRange", name: "age" },
  { label: "Exchange", name: "exchange" },
  { label: "Language", name: "language" },
  { label: "Viewability", name: "viewability" },
  { label: "BrandSafety", name: "brand_safety" },
  { label: "Devices", name: "device" },
  { label: "Environments", name: "environment" },
  { label: "Carrier", name: "carrier" },
  { label: "DevicePrice", name: "device_price" },
  { label: "TotalBudget", name: "total_budget" },
  { label: "BuyType", name: "buy_type" },
  { label: "UnitRate", name: "unit_rate" },
  { label: "LandingPage", name: "landing_page" },
  { label: "Creatives", name: "creative" },
];

export const CampaignReview = ({
  title,
  targetType,
  dataSources,
  getValues
}: ReviewSectionProps) => {
  return (
    <>
    <SectionContainer title={title}>
      <DetailGrid>
        {reviewFields.map((field) => (
          <DetailRow
                key={field.label}
                label={field.label}
                value={utils.formatAndGetReviewCampaignData(field.name, dataSources, getValues)}
            />
        ))}
      </DetailGrid>
    </SectionContainer>
    <SectionContainer title="Interest Targeting">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {targetType &&
            <TargetType 
              targetType={targetType} 
              isRemovable={false} 
          />}
        </Grid>
      </Grid>
    </SectionContainer>
  </>
  );
};