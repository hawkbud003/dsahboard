import { Grid, Typography } from '@mui/material';
import { FieldError, UseFormGetValues, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { CampaignFormData, DataSources } from '@/types/campaign';
import { FieldErrors } from 'react-hook-form';
import FileUpload from '../../layout/file-upload';
import FormField from '../../layout/form-field';
import { SectionContainer } from '../../layout/section-container';
import { DetailGrid } from '../../layout/section-container';

interface AdDetailsProps {
  register: UseFormRegister<CampaignFormData>;
  getValues: UseFormGetValues<CampaignFormData>;
  setValue: UseFormSetValue<CampaignFormData>;
  errors: FieldErrors<CampaignFormData>;
  dataSources: DataSources;
}

export const AdDetails = ({
  register,
  getValues,
  setValue,
  errors,
  dataSources,
}: AdDetailsProps) => {
  return (
    <SectionContainer title="Ad Details">
      <DetailGrid>
        <Grid item xs={12}>
          <FormField
            type="text"
            placeholder="Landing Page"
            name="landing_page"
            register={register}
            getValues={getValues}
            setValue={setValue}
            error={errors.landing_page as FieldError}
          />
        </Grid>

        <Grid item xs={12}>
          <FormField
            type="select"
            placeholder="Creative"
            name="creative"
            register={register}
            getValues={getValues}
            setValue={setValue}
            error={Array.isArray(errors.creative)?errors.creative[0]:errors.creative}
            data={dataSources.creatives.length > 0 ? dataSources.creatives : [{ id: 0, value: 'No data available. Please upload a creative first' }]}
          />
        </Grid>

      </DetailGrid>
    </SectionContainer>
  );
}; 