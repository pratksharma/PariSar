import { useAuthStore } from "@/stores/authStore";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync("refreshToken");

        const res = await axios.post(`${API_URL}/auth/refresh-access-token`, { refreshToken });

        const accessToken = res.data.data.accessToken;

        useAuthStore.setState({
          accessToken,
        });

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch {
        await SecureStore.deleteItemAsync("refreshToken");

        useAuthStore.setState({
          user: null,
          accessToken: null,
        });
      }
    }

    return Promise.reject(error);
  }
);
