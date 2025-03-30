import { User } from "./auth";
import { Creative } from "./creative";

export interface Location {
    id:number
    country: string;
    state: string;
    city: string;
    tier: string;
    population: number;
}

export interface CommonSelectResponse{
    id: number,
    label?: string,
    value: string
}

export interface Interest{
    id: number,
    subcategory: string
    category: string
}

export interface FileUpload{
    id: number;
    file: string;
};

export interface Campaign {
    id: number;
    name: string;
    age: string[]; 
    device: string[]; 
    environment: string[]; 
    exchange: string[];
    target_type: Interest[]; 
    created_at: string; 
    updated_at: string; 
    language: string[];
    carrier: string[]; 
    device_price: string[];  
    location: Location[];
    clicks:string;
    pay_rate:string;
    impressions:string;
    objective:string;
    landing_page: string;
    total_budget: number;
    buy_type: string;
    unit_rate: number;
    ctr:string;
    vtr:string;
    views:string;
    status:string;
    start_time:string;
    end_time:string;
    viewability: number;
    brand_safety: number;
    user:User,
    campaign_files:FileUpload[],
    creative:Creative[]
}

export interface CampaignFormData  {
    name: string;
    objective: string;
    age: string[];
    device: string[];
    environment: string[];
    location: number[];
    target_type: number[];
    exchange: string[];
    language: string[];
    carrier: string[];
    device_price: string[];
    landing_page?: string;
    total_budget: number;
    buy_type: string;
    unit_rate: number;  
    viewability: number;
    brand_safety: number;
    start_time?: string;
    end_time?: string;
    user?:string
    creative?:number[];
};

export interface CommonImpressionDetails{
    label:string,
    percentage:number
}
export interface ImpressionData{
    totalPopulation: number,
    age?: CommonImpressionDetails[],
    device?: CommonImpressionDetails[],
    environment?: CommonImpressionDetails[],
    carrier?:CommonImpressionDetails[],
}

export interface DataSources {
  ages: CommonSelectResponse[];
  devices: CommonSelectResponse[];
  environment: CommonSelectResponse[];
  location: Location[];
  exchange: CommonSelectResponse[];
  language: CommonSelectResponse[];
  carrier: CommonSelectResponse[];
  device_price: CommonSelectResponse[];
  interest_category: CommonSelectResponse[];
  interest: Interest[];
  selectedInterest: Interest[];
  buy_type: CommonSelectResponse[];
  brand_safety: CommonSelectResponse[];
  viewability: CommonSelectResponse[];
  users: User[];
  creatives: Creative[];
}