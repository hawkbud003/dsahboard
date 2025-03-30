import { Grid, SelectChangeEvent } from '@mui/material';
import React from 'react';
import { FieldError, FieldErrors, UseFormGetValues, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import FormField from '../../layout/form-field';
import { DetailGrid, SectionContainer } from '../../layout/section-container';
import { CommonSelectResponse, DataSources } from '@/types/campaign';

interface BudgetDetailsProps {
  register: UseFormRegister<any>;
  getValues: UseFormGetValues<any>;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
  dataSources: DataSources;
  campaignType: string;
}

export const BudgetDetails: React.FC<BudgetDetailsProps> = ({
  register,
  getValues,
  setValue,
  errors,
  dataSources,
  campaignType,
}) => {

    const [filteredBuyTypeList, setFilteredBuyTypeList] = React.useState<CommonSelectResponse[]>([]);

    React.useEffect(() => {
        if (dataSources?.buy_type?.length > 0) {
            const filteredBuyTypes = dataSources.buy_type.filter((buyType) => {
            if (campaignType === 'Banner') {
                return buyType.value !== 'CPV';
            } else if (campaignType === 'Video') {
                return buyType.value !== 'CPC';
            }
            return true;
            });
            setFilteredBuyTypeList(filteredBuyTypes);
        }
    }, [campaignType, dataSources?.buy_type]);

  return (
    <SectionContainer title="Budget & Bidding">
                    <DetailGrid>
                      {/* Total Budget */}
                      <Grid item xs={12} md = {6}>
                        <FormField
                            type="number"
                            placeholder="Total Budget"
                            name="total_budget"
                            valueAsNumber={true}
                            register={register}
                            setValue={setValue}
                            getValues={getValues}
                            error={Array.isArray(errors.total_budget)?errors.total_budget[0]:errors.total_budget}
                        />
                      </Grid>
                      {/* Unit Rate*/}
                      <Grid item xs={12} md={6}>
                        <FormField
                            type="number"
                            placeholder="Unit Rate"
                            name="unit_rate"
                            valueAsNumber={true}
                            getValues={getValues}
                            setValue={setValue}
                            register={register}
                            error={Array.isArray(errors.unit_rate)?errors.unit_rate[0]:errors.unit_rate}
                            />
                      </Grid>
                      {/* Buy Type*/}
                      <Grid item xs={12}>
                        <FormField
                            type="select"
                            placeholder="Buy Type"
                            name="buy_type"
                            register={register}
                            getValues={getValues}
                            setValue={setValue}
                            error={errors.buy_type as FieldError}
                            data={filteredBuyTypeList.length > 0 ? filteredBuyTypeList : [{ id: 0, value: 'No data available. Please try again later' }]}
                            multiple={false}
                            />
                      </Grid>
                    </DetailGrid>
                  </SectionContainer>
  );
};