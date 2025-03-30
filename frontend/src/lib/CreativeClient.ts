'use client';

import { Creative, CreativeFormData } from '@/types/creative';
import axiosInstance from './axios-instance';
import { utils } from './common-utils';


class CreativeClient {
   
    async getCreatives(pageNo:number,query:string): Promise<{count:number,data: Creative[]}> {
      try {
        const uri = query && query!==""? `/api/creatives/?page=${pageNo}&query=${query}`
          :`/api/creatives/?page=${pageNo}`;
        const response = await axiosInstance.get(uri, {
          headers: { 'Content-Type': 'application/json' },
        });
        return {count: response.data.count,data:response.data.results.data};
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }

    async getAllCreatives(): Promise<Creative[]> {
      try {
        const response = await axiosInstance.get("/creative_list/", {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data.data;
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }

    async createCreative(data: CreativeFormData): Promise<boolean> {
      try {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          formData.append(key, value);
        });        
        await axiosInstance.post(`/api/creatives/`, formData,{
          headers: { 'Content-Type': 'multipart/form-data;' },
        });
        return true
      } catch (error: any) {
          throw new Error(utils.handleErrorMessage(error));
      }
    }
}

export const creativeClient = new CreativeClient();