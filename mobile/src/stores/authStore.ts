import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { api } from "@/lib/api";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export type UserRole = "resident" | "admin" | "guard";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Society {
  _id: string;
  name: string;
  address: string;
  description: string;
  uniqueCode: string;
  admin: string;
  totalResidents: number;
  totalGuards: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  approvalStatus: ApprovalStatus;
  tower?: string;
  flatNumber?: string;
  society?: Society;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;

  loading: boolean;
  initialized: boolean;

  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<void>;

  login: (identifier: string, password: string) => Promise<void>;

  logout: () => Promise<void>;

  getUser: () => Promise<void>;

  refreshAccessToken: () => Promise<string | null>;

  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,

  loading: false,
  initialized: false,

  register: async (data) => {
    set({ loading: true });

    try {
      const res = await api.post("/auth/register", data);

      const { accessToken, refreshToken } = res.data;

      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);

      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);

      set({
        accessToken,
      });

      await get().getUser();
    } finally {
      set({ loading: false });
    }
  },

  login: async (identifier, password) => {
    set({ loading: true });

    try {
      const res = await api.post("/auth/login", {
        identifier,
        password,
      });

      const { accessToken, refreshToken } = res.data;

      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);

      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);

      set({
        accessToken,
      });

      await get().getUser();
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      const token = get().accessToken || (await SecureStore.getItemAsync(ACCESS_TOKEN_KEY));

      if (token) {
        await api.get("/auth/logout");
      }
    } catch {}

    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);

    set({
      user: null,
      accessToken: null,
    });
  },

  getUser: async () => {
    const token = get().accessToken || (await SecureStore.getItemAsync(ACCESS_TOKEN_KEY));

    if (!token) return;

    const res = await api.get("/auth/get-user");

    set({
      user: res.data.user,
    });
  },

  refreshAccessToken: async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

      if (!refreshToken) return null;

      const res = await api.post("/auth/refresh-access-token", {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = res.data;

      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken);

      set({ accessToken });

      return accessToken;
    } catch {
      await get().logout();
      return null;
    }
  },

  initialize: async () => {
    const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);

    if (accessToken) {
      set({
        accessToken,
      });

      try {
        await get().getUser();
      } catch {
        const success = await get().refreshAccessToken();

        if (success) {
          await get().getUser();
        }
      }
    }

    set({
      initialized: true,
    });
  },
}));
