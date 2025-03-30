import { CommonSelectResponse, Interest } from '@/types/campaign';
import { Grid, SelectChangeEvent, TextField } from '@mui/material';
import React from 'react';
import { FieldErrors, UseFormGetValues, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { DetailGrid, SectionContainer } from '../../layout/section-container';
import { DataSources } from '@/types/campaign';
import FormField from '../../layout/form-field';
import TargetType from '../../layout/target-type';

interface InterestSectionProps {
    register: UseFormRegister<any>;
    getValues: UseFormGetValues<any>;
    setValue: UseFormSetValue<any>;
    errors: FieldErrors<any>;
    dataSources: DataSources;
    handleSelectChange?: (event: SelectChangeEvent<unknown>,name: string) => void;
    targetType: string;
    isEditable: boolean;
}

const InterestSection: React.FC<InterestSectionProps> = ({
  register,
  getValues,
  setValue,
  errors,
  dataSources,
  handleSelectChange,
  targetType,
  isEditable
}) => {
  return (
    <>
      <SectionContainer title="Interest">
        <DetailGrid>
          {dataSources.interest_category.map((interestCategory) => (
            <React.Fragment key={(interestCategory as CommonSelectResponse).id}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Interest Category"
                  variant="outlined"
                  value={(interestCategory as CommonSelectResponse).label}
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormField
                  type="select"
                  placeholder="SubCategory"
                  name={`target_type_${(interestCategory as CommonSelectResponse).id}`}
                  register={register}
                  getValues={getValues}
                  setValue={setValue}
                  onChange={handleSelectChange}
                  error={Array.isArray(errors.target_type) ? errors.target_type[0] : errors.target_type}
                  data={
                    dataSources.interest.length > 0
                      ? dataSources.interest.filter(
                          (interest) => (interest as Interest).category === (interestCategory as CommonSelectResponse).label
                        )
                      : [{ id: 0, category: "No data available. Please select Interest" }]
                  }
                />
              </Grid>
            </React.Fragment>
          ))}
        </DetailGrid>
      </SectionContainer>

      {targetType && (
        <SectionContainer title="Interest Targeting">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TargetType 
                targetType={targetType} 
                isRemovable={isEditable} 
              />
            </Grid>
          </Grid>
        </SectionContainer>
      )}
    </>
  );
};

export default InterestSection;