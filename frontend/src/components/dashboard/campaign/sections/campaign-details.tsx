import { Grid, SelectChangeEvent } from '@mui/material';
import React from 'react';
import { FieldError, FieldErrors, UseFormGetValues, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import FormField from '../../layout/form-field';
import { DetailGrid, SectionContainer } from '../../layout/section-container';
import { DataSources } from '@/types/campaign';
import { useAuth } from '@/hooks/use-auth';

interface CampaignDetailsProps {
  register: UseFormRegister<any>;
  getValues: UseFormGetValues<any>;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
  dataSources: DataSources;
  handleSelectChange?: (event: SelectChangeEvent<unknown>,name: string) => void;
}

export const CampaignDetails: React.FC<CampaignDetailsProps> = ({
  register,
  getValues,
  setValue,
  errors,
  dataSources,
  handleSelectChange
}) => {
    const {auth} = useAuth();
  return (
    <SectionContainer title="Campaign Details">
        <DetailGrid>
        {/* Name Field - Full Width */}
        <Grid item xs={12}>
            <FormField
            type="text"
            placeholder="Name"
            name="name"
            getValues={getValues}
            setValue={setValue}
            register={register}
            error={errors.name as FieldError}
            />
        </Grid>

        {auth?.usertype === 'admin' && (
            <Grid item xs={12}>
            <FormField
                type="select"
                placeholder="User"
                name='user'
                register={register}
                getValues={getValues}
                setValue={setValue}
                multiple = {false}
                onChange={handleSelectChange}
                error={Array.isArray(errors.user) ? errors.user[0] : errors.user}
                data={dataSources.users.length > 0 ? dataSources.users : [{ id: 0, value: 'No data available. Please try again later' }]}
            />
            </Grid>
        )}
    
        {/* Date Fields - Split on Desktop */}
        <Grid item xs={12} md={6}>
            <FormField
            type="datepicker"
            placeholder="Start Date"
            name="start_time"
            register={register}
            getValues={getValues}
            setValue={setValue}
            error={errors.start_time as FieldError}
            />
        </Grid>
    
        <Grid item xs={12} md={6}>
            <FormField
            type="datepicker"
            placeholder="End Date"
            name="end_time"
            register={register}
            getValues={getValues}
            setValue={setValue}
            error={errors.end_time as FieldError}
            />
        </Grid>
        </DetailGrid>
    </SectionContainer>
  );
};