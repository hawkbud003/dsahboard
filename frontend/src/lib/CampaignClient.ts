'use client';

import { Campaign, CampaignFormData, CommonSelectResponse, ImpressionData, Interest, Location } from '@/types/campaign';
import axiosInstance from './axios-instance';
import { utils } from './CommonUtils';
import { User } from '@/types/auth';


class CampaignClient {
   
    async getCampaigns(pageNo:number,query:string): Promise<{count:number,data: Campaign[]}> {
      try {
        const uri = query && query!==""? `/api/fetch_user_campgain/?page=${pageNo}&query=${query}`
          :`/api/fetch_user_campgain/?page=${pageNo}`;
        const response = await axiosInstance.get(uri, {
          headers: { 'Content-Type': 'application/json' },
        });
        return {count: response.data.count,data:response.data.results.data};
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }

    async getCampaignsById(id:number): Promise<Campaign> {
      try {
        const response = await axiosInstance.get(`/api/campaigns/${id}/`, {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data.results.data;
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }

    async createUpdateCampaign(campaign:CampaignFormData,isUpdate:boolean, campaignId:number): Promise<boolean> {
      try {
        if(isUpdate){
          await axiosInstance.put(`/api/campaigns/${campaignId}/`, campaign, {
            headers: { 'Content-Type': 'application/json' },
          });
        }else{
          await axiosInstance.post('/api/campaigns/', campaign, {
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return true
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }

    async patchCampaign(fieldName:string,value:any,campaignId:number): Promise<boolean> {
      const data: { [key: string]: any } = {};
      data[fieldName] = value;
      try {
        await axiosInstance.patch(`/api/campaigns/${campaignId}/`, data,{
          headers: { 'Content-Type': 'application/json' },
        });
        return true
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }


    async uploadFile(file: File,fileType:string,campaignId:number):Promise<number> {
      const formData = new FormData();
      try {
        let uri='';
        switch(fileType){
          case 'images':
            formData.append('image', file);
            uri="/api/campaign-images/"
            break;
          case 'video':
            formData.append('video', file);
            uri="/api/campaign-video/"
            break;
          case 'tag_tracker':
            formData.append('file', file);
            uri="/api/tag_tacker/"
            break;
          case 'proximity':
            formData.append('file', file);
            uri="/api/proximity/"
            break;
          case 'weather':
            formData.append('file', file);
            uri="/api/weather/"
            break;
          case 'keywords':
            formData.append('file', file);
            uri="/api/keywords/"
            break;
          case 'report-upload':
            formData.append('file', file);
            uri=`/get-csv/${campaignId}`
            break;
          default:
            throw new Error("Invalid File Type")
        }
        const response = await axiosInstance.post(uri, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.id;
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }

    async getImpressionData() :Promise<ImpressionData>{
      try {
        const response = await axiosInstance.get('/impression', {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data.data;
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }

    async getBuyType() :Promise<CommonSelectResponse[]>{
      try {
        const response = await axiosInstance.get('/buyType', {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data.data;
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }

    async getLocations() :Promise<Location[]>{
      try {
        const response = await axiosInstance.get('/api/location', {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data.data;
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }

    async getExchange(): Promise<CommonSelectResponse[]> {
      try {
        const response = await axiosInstance.get('/exchange', {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data.data;
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }

    async getDistinctInterest(): Promise<CommonSelectResponse[]> {
      try {
        const response = await axiosInstance.get('/distinctInterest', {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data.data;
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }

    async getInterest(query:string): Promise<Interest[]> {
      try {
        const uri = query && query!="" ? `api/target_type?query=${encodeURIComponent(query)}`
          :"api/target_type";
        const response = await axiosInstance.get(uri, {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data.data;
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }

    async getAge(): Promise<CommonSelectResponse[]> {
      try {
        const response = await axiosInstance.get('/age', {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data.data;
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }

    async getDevice(): Promise<CommonSelectResponse[]> {
      try {
        const response = await axiosInstance.get('/device', {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data.data;
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }

    async getEnv(): Promise<CommonSelectResponse[]> {
      try {
        const response = await axiosInstance.get('/environment', {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data.data;
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }

    async getLanguage(): Promise<CommonSelectResponse[]> {
      try {
        const response = await axiosInstance.get('/language', {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data.data;
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }

    async getBrandSafety(): Promise<CommonSelectResponse[]> {
      try {
        const response = await axiosInstance.get('/brandSafety', {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data.data;
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }

    async getViewability(): Promise<CommonSelectResponse[]> {
      try {
        const response = await axiosInstance.get('/viewability', {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data.data;
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }


    async getCarrier(): Promise<CommonSelectResponse[]> {
      try {
        const response = await axiosInstance.get('/carrierData', {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data.data;
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }

    async getDevicePrice(): Promise<CommonSelectResponse[]> {
      try {
        const response = await axiosInstance.get('/devicePrice', {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data.data;
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }

    async getUsers(isAdmin:boolean): Promise<User[]> {
      if(isAdmin){
        try {
          const response = await axiosInstance.get('/api/users', {
            headers: { 'Content-Type': 'application/json' },
          });
          return response.data.results;
        } catch (error: any) {
          throw new Error(utils.handleErrorMessage(error));
        }
      }
      return [];
    }
    
}

export const campaignClient = new CampaignClient();
