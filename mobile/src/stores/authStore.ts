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
  admin:
    | string
    | {
        _id: string;
        name: string;
        email?: string;
        phone?: string;
      };
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

export interface VerifiedGuardInvite {
  inviteCode: string;
  name: string;
  phone: string;
  email?: string;
  society: {
    _id: string;
    name: string;
    address: string;
    uniqueCode: string;
  };
  userExists: boolean;
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

  registerGuard: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    inviteCode: string;
  }) => Promise<void>;

  login: (identifier: string, password: string, role?: UserRole) => Promise<void>;

  verifyGuardInvite: (inviteCode: string) => Promise<VerifiedGuardInvite>;

  acceptGuardInvite: (data: {
    inviteCode: string;
    password?: string;
    phone?: string;
    name?: string;
    email?: string;
  }) => Promise<void>;

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

  registerGuard: async (data) => {
    set({ loading: true });

    try {
      const res = await api.post("/auth/register-guard", data);

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

  login: async (identifier, password, role) => {
    set({ loading: true });

    try {
      const res = await api.post("/auth/login", {
        identifier,
        password,
        role,
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

  verifyGuardInvite: async (inviteCode) => {
    const res = await api.get(`/society/verify-guard-invite/${inviteCode}`);
    return res.data.invitation;
  },

  acceptGuardInvite: async (payload) => {
    set({ loading: true });

    try {
      const res = await api.post("/society/accept-guard-invite", payload);

      if (res.data.accessToken && res.data.refreshToken) {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, res.data.accessToken);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, res.data.refreshToken);
        set({ accessToken: res.data.accessToken });
      }

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

    try {
      const { useSocietyStore } = require("./societyStore");
      const { useVisitorStore } = require("./visitorStore");
      const { useNoticeStore } = require("./noticeStore");
      const { useComplaintStore } = require("./complaintStore");
      const { useAmenitiesStore } = require("./amenitiesStore");

      useSocietyStore.getState().clear();
      useVisitorStore.getState().clear();
      useNoticeStore.getState().clear();
      useComplaintStore.getState().clear();
      useAmenitiesStore.getState().clear();
    } catch {}

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
