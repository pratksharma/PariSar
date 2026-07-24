import { create } from "zustand";
import { api } from "@/lib/api";
import { useAuthStore } from "./authStore";

export interface Society {
  _id: string;
  name: string;
  code: string;
  address: string;
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
  loading: boolean;

  createSociety: (data: CreateSocietyData) => Promise<void>;
  joinSociety: (data: JoinSocietyData) => Promise<void>;
  getMySociety: () => Promise<void>;

  clear: () => void;
}

export const useSocietyStore = create<SocietyState>((set) => ({
  society: null,
  loading: false,

  createSociety: async (data) => {
    set({ loading: true });

    try {
      const res = await api.post("/society/create", data);

      set({
        society: res.data.society,
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
      society: res.data.society,
    });
  },

  clear: () => {
    set({
      society: null,
    });
  },
}));
