import { Grid, SelectChangeEvent } from '@mui/material';
import React from 'react';
import { FieldErrors, UseFormGetValues, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import FormField from '../../layout/form-field';
import { DetailGrid, SectionContainer } from '../../layout/section-container';
import { DataSources } from '@/types/campaign';
interface DeviceEnvironmentProps {
  register: UseFormRegister<any>;
  getValues: UseFormGetValues<any>;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
  dataSources: DataSources;
  handleSelectChange?: (event: SelectChangeEvent<unknown>,name: string) => void;
}

export const DeviceEnvironment: React.FC<DeviceEnvironmentProps> = ({
  register,
  getValues,
  setValue,
  errors,
  dataSources,
  handleSelectChange
}) => {
  return (
    <SectionContainer title="Device & Environment">
      {/* Device */}
      <DetailGrid>
        <Grid item xs={12} md={6}>
          <FormField
              type="select"
              placeholder="Devices"
              name="device"
              register={register}
              getValues={getValues}
              setValue={setValue}
              error={Array.isArray(errors.device)?errors.device[0]:errors.device}
              data={dataSources.devices.length > 0 ? dataSources.devices : [{ id: 0, value: 'No data available. Please try again later' }]}
            />
        </Grid>
      
      {/* Environment */}
      <Grid item xs={12} md={6}>
          <FormField
              type="select"
              placeholder="Environments"
              name="environment"
              register={register}
              getValues={getValues}
              setValue={setValue}
              error={Array.isArray(errors.environment)?errors.environment[0]:errors.environment}
              data={dataSources.environment.length > 0 ? dataSources.environment : [{ id: 0, value: 'No data available. Please try again later' }]}
          />
      </Grid>

        {/* Carrier */}
        <Grid item xs={12} md={6}>
        <FormField
            type="select"
            placeholder="Carrier"
            name="carrier"
            register={register}
            getValues={getValues}
            setValue={setValue}
            error={Array.isArray(errors.carrier)?errors.carrier[0]:errors.carrier}
            data={dataSources.carrier.length > 0 ? dataSources.carrier : [{ id: 0, value: 'No data available. Please try again later' }]}
        />
      </Grid>

      {/* DevicePrice */}
      <Grid item xs={12} md={6}>
        <FormField
            type="select"
            placeholder="DevicePrice"
            name="device_price"
            register={register}
            getValues={getValues}
            setValue={setValue}
            error={Array.isArray(errors.device_price)?errors.device_price[0]:errors.device_price}
            data={dataSources.device_price.length > 0 ? dataSources.device_price : [{ id: 0, value: 'No data available. Please try again later' }]}
        />
      </Grid>
      </DetailGrid>
    </SectionContainer>
  );
};