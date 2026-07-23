import { create } from "zustand";
import { api } from "@/lib/api";

export type NoticeTag =
  "general" | "maintenance" | "security" | "event" | "emergency" | "meeting" | "payment" | "other";

export interface Notice {
  _id: string;
  title: string;
  description: string;
  tag: NoticeTag;
  issuedBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CreateNoticeData {
  title: string;
  description: string;
  tag: NoticeTag;
}

interface UpdateNoticeData {
  title?: string;
  description?: string;
  tag?: NoticeTag;
}

interface NoticeActionResponse {
  success: boolean;
  message: string;
  notice?: Notice;
}

interface NoticeState {
  notices: Notice[];
  loading: boolean;

  getNotices: () => Promise<void>;

  createNotice: (data: CreateNoticeData) => Promise<NoticeActionResponse>;

  updateNotice: (id: string, data: UpdateNoticeData) => Promise<NoticeActionResponse>;

  deleteNotice: (id: string) => Promise<NoticeActionResponse>;

  clear: () => void;
}

export const useNoticeStore = create<NoticeState>((set) => ({
  notices: [],
  loading: false,

  getNotices: async () => {
    set({ loading: true });

    try {
      const { data } = await api.get("/notice/get-notices");

      set({
        notices: data.notices,
      });
    } finally {
      set({ loading: false });
    }
  },

  createNotice: async (payload) => {
    set({ loading: true });

    try {
      const { data } = await api.post("/notice/create", payload);

      set((state) => ({
        notices: [data.notice, ...state.notices],
      }));

      return {
        success: true,
        message: data.message,
        notice: data.notice,
      };
    } finally {
      set({ loading: false });
    }
  },

  updateNotice: async (id, payload) => {
    set({ loading: true });

    try {
      const { data } = await api.patch(`/notice/update/${id}`, payload);

      set((state) => ({
        notices: state.notices.map((notice) => (notice._id === id ? data.notice : notice)),
      }));

      return {
        success: true,
        message: data.message,
        notice: data.notice,
      };
    } finally {
      set({ loading: false });
    }
  },

  deleteNotice: async (id) => {
    set({ loading: true });

    try {
      const { data } = await api.delete(`/notice/delete/${id}`);

      set((state) => ({
        notices: state.notices.filter((notice) => notice._id !== id),
      }));

      return {
        success: true,
        message: data.message,
      };
    } finally {
      set({ loading: false });
    }
  },

  clear: () =>
    set({
      notices: [],
      loading: false,
    }),
}));
