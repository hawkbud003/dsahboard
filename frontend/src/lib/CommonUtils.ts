import { Campaign, CampaignFormData, ImpressionData, Interest, Location } from "@/types/campaign";
import { Creative, CreativeFormData } from "@/types/creative";
import { SelectChangeEvent } from "@mui/material";
import { AxiosError } from "axios";
import dayjs from "dayjs";
import { UseFormGetValues } from "react-hook-form";


class Utils {

    isErrorResponse(data: unknown): data is { message: Record<string, string[]> } {
        return (
          typeof data === 'object' &&
          data !== null &&
          'message' in data &&
          typeof (data as any).message === 'object' || typeof (data as any).message === 'string'
        );
    }
    
        handleErrorMessage(error:AxiosError): string {
            if (error.response?.data && this.isErrorResponse(error.response.data)) {
                const errorResponse = error.response?.data
                if (errorResponse && errorResponse.message) {
                    if(typeof errorResponse.message === 'string')
                        return errorResponse.message;

                    const errorMessages = Object.values(errorResponse.message);
                    for (const errors of errorMessages) {
                        if (Array.isArray(errors) && errors.length > 0) {
                            return errors[0]; 
                        }
                    }
                }
                
            }else if(error.response?.data && typeof error.response?.data === 'object'){
                const errorMessages = Object.values(error.response?.data);
                console.log(errorMessages)
                if(Array.isArray(errorMessages)){
                    for (const errors of errorMessages) {
                        if (Array.isArray(errors) && errors.length > 0) {
                            return errors[0]; 
                        }else if(typeof errors === 'string'){
                            return errors;
                        }
                    }
                }
            }
            return "An unexpected error occurred. Please try again later." ;
        }

    transformCampaignToFormData(campaign: Campaign): CampaignFormData {
        return {
          name: campaign.name,
          objective: campaign.objective,
          age: campaign.age,
          device: campaign.device,
          environment: campaign.environment,
          location: campaign.location.map(loc => loc.id),
          target_type: campaign.target_type.map(interest => interest.id),
          exchange: campaign.exchange,
          language: campaign.language,
          carrier: campaign.carrier,
          device_price: campaign.device_price,
          landing_page: campaign.landing_page,
          total_budget: campaign.total_budget,
          buy_type: campaign.buy_type,
          unit_rate: campaign.unit_rate,
          viewability: campaign.viewability, 
          brand_safety: campaign.brand_safety, 
          creative: campaign.creative.map(c => c.id),
          start_time: campaign.start_time,
          end_time: campaign.end_time
        };
    }

    formatProperCase(value:string) :string {
        if (value === undefined || value === null) {
            return "";
        }
        return value.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
    }
    
    formatTargetIdToSubCategory(values:number[],targetTypeList:Interest[]){
        return values.map((interest) => { 
                const temp = targetTypeList.find((i) => i.id === interest);
                return temp ? temp.category + ">" + temp.subcategory : "Unknown";
        }).join(", ");
    }

    formatLocationIdToCity(values: number[], locationList: Location[]): string {
        return values.map((loc) => {
            const location = locationList.find((l) => l.id === loc);
            return location ? location.city : "Unknown";
        }).join(", ");
    }

    formatCreativeIdToName(values: number[], creatives: Creative[]): string {
        return values.map((creativeId) => {
            const creative = creatives.find((creative) => creative.id === creativeId);
            return creative ? creative.name : "Unknown";
        }).join(", ");
    }

    formatAndGetReviewCampaignData = (name: string,dataSources:any,getValues:UseFormGetValues<CampaignFormData>): string => {
        const value = getValues(name as keyof CampaignFormData);
        if (value) {
            switch (name) {
                case "location":
                    return utils.formatLocationIdToCity(value as number[], dataSources.location);
                case "target_type":
                    return utils.formatTargetIdToSubCategory(value as number[], dataSources.interest);
                case "start_time":
                case "end_time":
                    return dayjs(value as number).format("YYYY-MM-DD");
                case "images":
                case "video":
                case "keywords":
                case "tag_tracker":
                    return (value as unknown as FileList).length !== 0 ? "File uploaded" : "Not Provided";
                case "total_budget":
                case "unit_rate":
                    return `₹${value}`
                case "creative":
                    return utils.formatCreativeIdToName(value as number[], dataSources.creatives);
                default:
                    return value as string;
            }
        }
        return "Not provided";
    };

    formatAndGetReviewCreativeData = (name: string,getValues:UseFormGetValues<CreativeFormData>): string => {
        const value = getValues(name as keyof CreativeFormData);
        if (value) {
            if(name==="file"){
                return (value as unknown as FileList).length !== 0 ? "File selected" : "Not Provided";
            }
            return value as string;
        }
        return "Not provided";
    };

    calculateTargetPopulation = (name:string,locationList:Location[],
        getValues:UseFormGetValues<CampaignFormData>,impressionData:ImpressionData,
        event?: SelectChangeEvent<unknown>):number=>{
        
        const selectedValue: string[] = event ? event.target.value as string[]:[];
        
        const selectedLocs =getValues("location")? name==="age" ? getValues("location"):  Array.from(
            new Set([...selectedValue, ...getValues("location") as Number[]])
            ) as string[] : selectedValue;
        
        const selectedAges = getValues("age") ? name==="location"? getValues("age"): Array.from(
            new Set([...selectedValue, ...getValues("age") as string[]])
            ) as string[] : selectedValue;
        
        const effectivePopulation = selectedLocs ? selectedLocs.reduce((total:number, locationId) => {
        const location = locationList.find((loc) => loc.id === locationId);
        return total + (Number(location?.population) || 0);
        }, 0):0;
    
        const effectivePercentage = selectedAges ? selectedAges.reduce((total, label) => {
        const ageGroup = impressionData?.age?.find(age => age.label === label);
        return total + (ageGroup?.percentage || 0);
        }, 0):0;

        return effectivePercentage > 0 ? Math.round((effectivePopulation * effectivePercentage) / 100)
        : effectivePopulation;
    }

}

export const utils = new Utils();
