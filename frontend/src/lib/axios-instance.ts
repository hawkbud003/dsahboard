import axios from 'axios';
import { authClient } from './AuthClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    const authEndpoints = ['/token', '/reset-password', '/register'];
    if (token && !authEndpoints.some((endpoint) => config.url?.includes(endpoint))) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: Error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async(error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        if(!originalRequest.url?.includes('/token/refresh/')){
          const newAccessToken = await authClient.refreshToken();
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          localStorage.setItem('accessToken', newAccessToken);
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        authClient.clearLocalStorage()
        window.location.reload();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
export default axiosInstance;
