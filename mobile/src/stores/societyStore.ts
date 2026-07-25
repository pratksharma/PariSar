import { create } from "zustand";
import { api } from "@/lib/api";
import { useAuthStore } from "./authStore";

export interface Society {
  _id: string;
  name: string;
  address: string;
  description?: string;
  uniqueCode: string;
  admin?: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  totalResidents?: number;
  totalGuards?: number;
  isActive?: boolean;
}

export interface GuardInvitation {
  _id: string;
  name: string;
  phone: string;
  email?: string | null;
  inviteCode: string;
  accepted: boolean;
  expiresAt: string;
  createdAt: string;
  invitedBy?: { name: string };
}

export interface PendingRequest {
  _id: string;
  name: string;
  tower?: string;
  flatNumber?: string;
  phone?: string;
}

interface CreateSocietyData {
  name: string;
  address: string;
  description: string;
  tower: string;
  flatNumber: string;
}

interface JoinSocietyData {
  uniqueCode: string;
  tower: string;
  flatNumber: string;
}

interface SocietyState {
  society: Society | null;
  guardInvitations: GuardInvitation[];
  pendingRequests: PendingRequest[];
  loading: boolean;

  createSociety: (data: CreateSocietyData) => Promise<void>;
  joinSociety: (data: JoinSocietyData) => Promise<void>;
  getMySociety: () => Promise<void>;
  getGuardInvitations: () => Promise<void>;
  getPendingRequests: () => Promise<void>;

  clear: () => void;
}

export const useSocietyStore = create<SocietyState>((set) => ({
  society: null,
  guardInvitations: [],
  pendingRequests: [],
  loading: false,

  createSociety: async (data) => {
    set({ loading: true });

    try {
      const res = await api.post("/society/create", data);

      set({
        society: res.data.data,
      });

      await useAuthStore.getState().getUser();
    } finally {
      set({ loading: false });
    }
  },

  joinSociety: async (data) => {
    set({ loading: true });

    try {
      await api.post("/society/join", data);

      await useAuthStore.getState().getUser();
      await useSocietyStore.getState().getMySociety();
    } finally {
      set({ loading: false });
    }
  },

  getMySociety: async () => {
    const res = await api.get("/society/my");

    set({
      society: res.data.data,
    });
  },

  getGuardInvitations: async () => {
    const res = await api.get("/society/guard-invitations");

    set({
      guardInvitations: res.data.invitations ?? [],
    });
  },

  getPendingRequests: async () => {
    const res = await api.get("/society/pending-requests");

    set({
      pendingRequests: res.data.data ?? [],
    });
  },

  clear: () => {
    set({
      society: null,
      guardInvitations: [],
      pendingRequests: [],
    });
  },
}));
