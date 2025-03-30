'use client';

import { ProfileFormData, UpdatePasswordParams, User } from '@/types/auth';
import axiosInstance from './axios-instance';
import { utils } from './CommonUtils';

class AccountClient {

    async getUser(): Promise<User> {
      try {
        const response = await axiosInstance.get('/api/profile/', {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data.data;
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }

    async updateUser(user: ProfileFormData): Promise<User> {
      try {
        const response = await axiosInstance.put('/api/user/update/', user, {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }

    async updatePassword(password:UpdatePasswordParams): Promise<boolean> {
      try {
        await axiosInstance.put('/api/user/change-password/', password, {
          headers: { 'Content-Type': 'application/json' },
        });
        return true;
      } catch (error: any) {
        throw new Error(utils.handleErrorMessage(error));
      }
    }

}

export const accountClient = new AccountClient();
