"use client"
import { useAuth } from '@/hooks/use-auth';
import { useDataSources } from '@/hooks/useDataSources';
import { useFormSections } from '@/hooks/useFormSections';
import { campaignClient } from '@/lib/campaign-client';
import { utils } from '@/lib/common-utils';
import { paths } from '@/paths';
import { CampaignFormData } from '@/types/campaign';
import { CampaignFormSchema } from '@/types/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, CircularProgress, SelectChangeEvent } from '@mui/material';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { ProgressIndicator } from '../layout/progress-indicator';
import { ImpressionComponent } from './impression-panel';
import { AdDetails } from './sections/ad-details';
import { BudgetDetails } from './sections/budget-details';
import { CampaignDetails } from './sections/campaign-details';
import { CampaignReview } from './sections/campaign-review';
import { CampaignType } from './sections/campaign-type';
import { DeviceEnvironment } from './sections/device-environment';
import InterestSection from './sections/interest-type';
import { TargetingType } from './sections/targeting-type';

export default function CreateCampaign(): React.JSX.Element {

    const router = useRouter();
    const {auth} = useAuth();
    const { dataSources, impressionData, totalPopulation, fetchData } = useDataSources(auth);
    const { activeSection, nextSection, prevSection } = useFormSections(7);
    const [isCampaignCreated,setIsCampaignCreated] = React.useState<boolean>(false);
    const [targetPopulation, setTargetPopulation] = React.useState<number>(0);
    const [campaignType, setCampaignType] = React.useState<'Banner' | 'Video'>('Banner');
    const [targetType, setTargetType] = React.useState<string>('');
    const [isEditable,setIsEditable] = React.useState<boolean>(false);
    const [campaignId,setCampaignId] = React.useState<number>(-1);
    const [isPending, setIsPending] = React.useState<boolean>(false);
    const mandatoryFieldsBySection: Record<number, string[]> = {
      0: ["objective"], 
      1: ["name","start_time","end_time"], 
      2: ["location", "age", "exchange", "language", "viewability", "brand_safety","device", "environment", "carrier", "device_price"],
      3: ["target_type"],
      4: ["creative","total_budget", "buy_type", "unit_rate"]
    };
    
    const {
      register,
      setValue,
      setError,
      clearErrors,
      handleSubmit,
      getValues,
      formState: { errors },
    } = useForm<CampaignFormData>({ resolver: zodResolver(CampaignFormSchema) });
  
    const onSubmit = async (data: CampaignFormData) => {
      clearErrors();
      if(!data) 
        return;

      setIsPending(true);
      try {
        const result = await campaignClient.createUpdateCampaign(data,isEditable,campaignId);
        if (result) {
          setIsCampaignCreated(true);
          router.push(paths.dashboard.overview);
        }
      } catch (error:any) {
        setError('root', { type: 'server', message: error.message});
      } finally {
        setIsPending(false);
      }
    };
  
    const handleSelectChange = async (event: SelectChangeEvent<unknown>,name: string) => {  
      if(name.startsWith('target_type')){
        const selectedValue: number[] = event.target.value as number[];
        const selectedTargetType = getValues("target_type")? Array.from(
          new Set([...selectedValue, ...getValues("target_type") as Number[]])
        ) as number[]:selectedValue;
        setValue("target_type",selectedTargetType)
        setTargetType(utils.formatTargetIdToSubCategory(selectedTargetType,dataSources.interest));
      }
      
      if(["location","age"].includes(name) && impressionData && dataSources){
        setTargetPopulation(utils.calculateTargetPopulation(name,dataSources.location,getValues,impressionData,event))
      }
    };

    const handleNextSection = () => {
      const mandatoryFields = mandatoryFieldsBySection[activeSection];
      nextSection(getValues, setError, clearErrors, mandatoryFields);
    };

    const setFormDataOnEdit = ()=>{
      const storedCampaign = sessionStorage.getItem("campaign");
      const storedCampaignId = sessionStorage.getItem("id") ? Number(sessionStorage.getItem("id")):-1;
      if (storedCampaign && storedCampaignId !== -1) {
        setIsEditable(true);
        setCampaignId(storedCampaignId);
        const parsedCampaign = JSON.parse(storedCampaign);
        sessionStorage.clear()
        Object.keys(parsedCampaign).forEach((key) => {
          if(key === "objective"){
            setCampaignType(parsedCampaign[key])
          }
          setValue(key as keyof CampaignFormData, parsedCampaign[key]);
        });  
      }
    }
    
    React.useEffect(() => {
      fetchData();
      setFormDataOnEdit();
    }, []);

    React.useEffect(() => {
      if (dataSources?.interest && getValues("target_type")) {
        setTargetType(utils.formatTargetIdToSubCategory(getValues("target_type"), dataSources.interest));
      }

      if (!getValues("objective")) {
        setValue('objective', 'Banner');
      }
    }, [dataSources?.interest]);

    React.useEffect(() => {
      if (impressionData && dataSources?.location) {
        setTargetPopulation(utils.calculateTargetPopulation("ages", dataSources.location, getValues, impressionData, undefined));
      }
    }, [impressionData, dataSources?.location]);
  
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column",
            sm: "column",
            md: "row",
          },
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: { xs: 2, sm: 3, md: 4 },
          p: { xs: 1, sm: 2, md: 3 },
          
        }}
      >
        <Box sx={{ flex: { xs: "1", md: "2" , lg:"3"}, overflow: "hidden" }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: "flex", 
                flexDirection: "column",
                gap: 3 ,
                border: 1,
                padding:2 ,
                borderColor: "grey.300",
            }}>

              <ProgressIndicator activeSection={activeSection} totalSections={6} />

              {activeSection === 0 && (
                  <CampaignType
                    campaignType={campaignType} 
                    setCampaignType={setCampaignType} 
                    setValue={setValue} 
                    errors={errors}
                  />
               )}

              {activeSection === 1 && (
                <CampaignDetails 
                  register={register}
                  getValues={getValues}
                  setValue={setValue}
                  errors={errors}
                  dataSources={dataSources}
                />
              )}

              {activeSection === 2 && (
                <>
                  <TargetingType 
                    register={register}
                    getValues={getValues}
                    setValue={setValue}
                    errors={errors}
                    dataSources={dataSources}
                    handleSelectChange={handleSelectChange}
                  />
                  <DeviceEnvironment 
                    register={register}
                    getValues={getValues}
                    setValue={setValue}
                    errors={errors}
                    dataSources={dataSources}
                    handleSelectChange={handleSelectChange}
                  />
                </>
              )}

              {activeSection === 3 && (
                <InterestSection 
                  register={register}
                  getValues={getValues}
                  setValue={setValue}
                  errors={errors}
                  dataSources={dataSources}
                  handleSelectChange={handleSelectChange}
                  targetType={targetType}
                  isEditable={isEditable}
                />
              )}

              {activeSection === 4 && (
                <>
                  <BudgetDetails
                    register={register}
                    getValues={getValues}
                    setValue={setValue}
                    errors={errors}
                    dataSources={dataSources}
                    campaignType={campaignType}
                  />
                  
                  <AdDetails
                    register={register}
                    getValues={getValues}
                    setValue={setValue}
                    dataSources={dataSources}
                    errors={errors}
                  />         
                </>
              )}

              {activeSection === 5 && (
                <CampaignReview 
                  title="Campaign Review"
                  targetType={targetType}
                  dataSources={dataSources}
                  getValues={getValues}
                />                  
              )}
            
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button variant="outlined" onClick={prevSection} disabled={activeSection === 0}>
                  Previous
                </Button>
                {activeSection < 5 && (
                  <Button variant="contained" color="primary" onClick={handleNextSection}>
                    {activeSection === 4 ? "Review" : "Next"}
                  </Button>
                )}
              </Box>
              {activeSection === 5 && (
                <Box sx={{ textAlign: "center", mt: 3 }}>
                  {!isPending ? (
                    <Button sx={{borderRadius:0.75}} variant="contained" color="primary" type="submit">
                      {isEditable ? "Update Campaign" : "Create Campaign"}
                    </Button>
                  ) : (
                    <Box sx={{ marginLeft: 2 }}>
                      <CircularProgress />
                    </Box>
                  )}
                </Box>
              )}
              <Box sx={{ mt: 2 }}>
                {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
                {isCampaignCreated ? <Alert sx={{margin:2}} color="success">Campaign created successfully!</Alert> : null}
              </Box>
            </Box>
          </form>
        </Box>

        {/* Right Section (Chart) */}
        <Box
          sx={{
            flex: { md: "1", lg: "1" },
            display: { xs: "none", sm: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "background.paper",
            p: 2,
            border:1,
            borderColor: "grey.200",
            position: "sticky",
            top: '72px',
            alignSelf: 'flex-start',
          }}
        >
          <ImpressionComponent title= " Campaign Population Breakdown" targetPopulation={targetPopulation} totalPopulation={totalPopulation} />
        </Box>
      </Box>
    );
  }

  