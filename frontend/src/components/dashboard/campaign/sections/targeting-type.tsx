import { Grid, SelectChangeEvent } from '@mui/material';
import React from 'react';
import { FieldErrors, UseFormGetValues, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import FormField from '../../layout/form-field';
import { DetailGrid, SectionContainer } from '../../layout/section-container';
import { DataSources } from '@/types/campaign';

interface TargetingTypeProps {
  register: UseFormRegister<any>;
  getValues: UseFormGetValues<any>;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
  dataSources: DataSources;
  handleSelectChange?: (event: SelectChangeEvent<unknown>,name: string) => void;
}

export const TargetingType: React.FC<TargetingTypeProps> = ({
  register,
  getValues,
  setValue,
  errors,
  dataSources,
  handleSelectChange
}) => {
  return (
    <SectionContainer title="Targeting Type">
      <DetailGrid>
        {/* Location */}
        <Grid item xs={12}>
          <FormField
            type="select"
            placeholder="Locations"
            name="location"
            register={register}
            getValues={getValues}
            setValue={setValue}
            onChange={handleSelectChange}
            error={Array.isArray(errors.location)?errors.location[0]:errors.location}
            data={dataSources.location.length > 0 ? dataSources.location : [{ id: 0, city: 'No data available. Please try again later' }]}
          />
        </Grid>

        {/* Age */}
        <Grid item xs={12} md={6}>
          <FormField
            type="select"
            placeholder="Age Range"
            name="age"
            register={register}
            getValues={getValues}
            setValue={setValue}
            onChange={handleSelectChange}
            error={Array.isArray(errors.age)?errors.age[0]:errors.age}
            data={dataSources.ages.length > 0 ? dataSources.ages : [{ id: 0, value: 'No data available. Please try again later' }]}
          />
        </Grid>
        
        {/* Exchange */}
        <Grid item xs={12} md={6}>                      
          <FormField
            type="select"
            placeholder="Exchange"
            name="exchange"
            register={register}
            getValues={getValues}
            setValue={setValue}
            error={Array.isArray(errors.exchange)?errors.exchange[0]:errors.exchange}
            data={dataSources.exchange.length > 0 ? dataSources.exchange : [{ id: 0, value: 'No data available. Please try again later' }]}
          />
        </Grid>

        {/* Langugage */}
        <Grid item xs={12} md={4}>
          <FormField
            type="select"
            placeholder="Language"
            name="language"
            register={register}
            getValues={getValues}
            setValue={setValue}
            error={Array.isArray(errors.language)?errors.language[0]:errors.language}
            data={dataSources.language.length > 0 ? dataSources.language : [{ id: 0, value: 'No data available. Please try again later' }]}
          />
        </Grid>

        {/* Viewability*/}
        <Grid item xs={12} md={4}>
          <FormField
            type="select"
            placeholder="Viewability"
            name="viewability"
            register={register}
            getValues={getValues}
            setValue={setValue}
            error={Array.isArray(errors.viewability)?errors.viewability[0]:errors.viewability}
            data={dataSources.viewability.length > 0 ? dataSources.viewability : [{ id: 0, value: 'No data available. Please try again later' }]}
            multiple={false}
          />
        </Grid>

        {/* Brandsafety*/}
        <Grid item xs={12} md={4}>
          <FormField
            type="select"
            placeholder="Brand Safety"
            name="brand_safety"
            register={register}
            getValues={getValues}
            setValue={setValue}
            error={Array.isArray(errors.brand_safety)?errors.brand_safety[0]:errors.brand_safety}
            data={dataSources.brand_safety.length > 0 ? dataSources.brand_safety : [{ id: 0, value: 'No data available. Please try again later' }]}
            multiple={false}
          />
        </Grid>
      </DetailGrid>
    </SectionContainer>
  );
};