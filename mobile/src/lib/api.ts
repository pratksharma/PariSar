import { useAuthStore } from "@/stores/authStore";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_URL,
});

let refreshPromise: Promise<string> | null = null;

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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = (async () => {
            const refreshToken = await SecureStore.getItemAsync("refreshToken");

            if (!refreshToken) {
              throw new Error("No refresh token");
            }

            const res = await axios.post(`${API_URL}/auth/refresh-access-token`, { refreshToken });

            const accessToken = res.data.data.accessToken;

            await SecureStore.setItemAsync("accessToken", accessToken);

            useAuthStore.setState({
              accessToken,
            });

            return accessToken;
          })().finally(() => {
            refreshPromise = null;
          });
        }

        const accessToken = await refreshPromise;

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch {
        await useAuthStore.getState().logout();
      }
    }

    return Promise.reject(error);
  }
);
