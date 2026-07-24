import { useAuthStore } from "@/stores/authStore";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_URL,
});

let refreshPromise: Promise<string | null> | null = null;

api.interceptors.request.use(async (config) => {
  let token = useAuthStore.getState().accessToken;

  if (!token) {
    token = await SecureStore.getItemAsync("accessToken");
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      originalRequest?.url?.includes("/auth/refresh-access-token") ||
      originalRequest?.url?.includes("/auth/logout")
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = useAuthStore
            .getState()
            .refreshAccessToken()
            .finally(() => {
              refreshPromise = null;
            });
        }

        const accessToken = await refreshPromise;

        if (!accessToken) {
          return Promise.reject(error);
        }

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
