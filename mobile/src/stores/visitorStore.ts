import { create } from "zustand";
import { api } from "@/lib/api";

export type VisitorStatus =
  "pending" | "approved" | "rejected" | "checked_in" | "checked_out" | "cancelled";

export interface VisitorProfile {
  _id: string;
  name: string;
  phone: string;
  vehicleNumber?: string;
}

export interface VisitorEntry {
  _id: string;
  society: string;
  visitor: VisitorProfile;
  resident: {
    _id: string;
    name: string;
    phone?: string;
    tower?: string;
    flatNumber?: string;
  };
  approvedBy?: { _id: string; name: string } | string;
  createdByGuard?: { _id: string; name: string } | string;
  purpose: string;
  type: string;
  tower: string;
  flatNumber: string;
  status: VisitorStatus;
  qrToken?: string;
  qrUsed?: boolean;
  expectedAt?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PreApproveVisitorPayload {
  name: string;
  phone: string;
  vehicleNumber?: string;
  purpose: string;
  type: string;
  tower?: string;
  flatNumber?: string;
  remarks?: string;
  expectedAt?: string;
}

export interface CreateVisitorPayload {
  name: string;
  phone: string;
  vehicleNumber?: string;
  purpose: string;
  type: string;
  tower: string;
  flatNumber: string;
  remarks?: string;
}

interface VisitorState {
  visitors: VisitorEntry[];
  loading: boolean;

  getVisitors: () => Promise<void>;
  createVisitor: (payload: CreateVisitorPayload) => Promise<VisitorEntry>;
  createPreApprovedVisitor: (payload: PreApproveVisitorPayload) => Promise<VisitorEntry>;
  approveVisitor: (entryId: string) => Promise<VisitorEntry>;
  rejectVisitor: (entryId: string) => Promise<VisitorEntry>;
  scanVisitorQr: (qrToken: string) => Promise<VisitorEntry>;
  checkOutVisitor: (entryId: string) => Promise<VisitorEntry>;
  clear: () => void;
}

export const useVisitorStore = create<VisitorState>((set, get) => ({
  visitors: [],
  loading: false,

  getVisitors: async () => {
    set({ loading: true });

    try {
      const { data } = await api.get("/visitor");

      set({ visitors: data.visitors ?? [] });
    } finally {
      set({ loading: false });
    }
  },

  createPreApprovedVisitor: async (payload) => {
    set({ loading: true });

    try {
      const { data } = await api.post("/visitor/pre-approvals", payload);
      const visitorEntry = data.visitorEntry;

      set((state) => ({ visitors: [visitorEntry, ...state.visitors] }));

      return visitorEntry;
    } finally {
      set({ loading: false });
    }
  },

  createVisitor: async (payload) => {
    set({ loading: true });

    try {
      const { data } = await api.post("/visitor/create", payload);
      const visitorEntry = data.visitorEntry;

      set((state) => ({ visitors: [visitorEntry, ...state.visitors] }));

      return visitorEntry;
    } finally {
      set({ loading: false });
    }
  },

  approveVisitor: async (entryId) => {
    set({ loading: true });

    try {
      const { data } = await api.patch(`/visitor/entries/${entryId}/approve`);
      const visitorEntry = data.visitorEntry;

      set((state) => ({
        visitors: state.visitors.map((item) =>
          item._id === visitorEntry._id ? visitorEntry : item
        ),
      }));

      return visitorEntry;
    } finally {
      set({ loading: false });
    }
  },

  rejectVisitor: async (entryId) => {
    set({ loading: true });

    try {
      const { data } = await api.patch(`/visitor/entries/${entryId}/reject`);
      const visitorEntry = data.visitorEntry;

      set((state) => ({
        visitors: state.visitors.map((item) =>
          item._id === visitorEntry._id ? visitorEntry : item
        ),
      }));

      return visitorEntry;
    } finally {
      set({ loading: false });
    }
  },

  scanVisitorQr: async (qrToken) => {
    set({ loading: true });

    try {
      const { data } = await api.patch("/visitor/entries/check-in", { qrToken });
      const visitorEntry = data.visitorEntry;

      set((state) => ({
        visitors: state.visitors.map((item) =>
          item._id === visitorEntry._id ? visitorEntry : item
        ),
      }));

      return visitorEntry;
    } finally {
      set({ loading: false });
    }
  },

  checkOutVisitor: async (entryId) => {
    set({ loading: true });

    try {
      const { data } = await api.patch(`/visitor/entries/${entryId}/check-out`);
      const visitorEntry = data.visitorEntry;

      set((state) => ({
        visitors: state.visitors.map((item) =>
          item._id === visitorEntry._id ? visitorEntry : item
        ),
      }));

      return visitorEntry;
    } finally {
      set({ loading: false });
    }
  },

  clear: () => set({ visitors: [], loading: false }),
}));
