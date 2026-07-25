import { create } from "zustand";
import { api } from "@/lib/api";

export type ComplaintStatus = "open" | "resolved";

export interface Complaint {
  _id: string;
  society: string;
  resident:
    | {
        _id: string;
        name: string;
        flatNumber?: string;
        tower?: string;
      }
    | string;
  title: string;
  description: string;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
}

interface CreateComplaintPayload {
  title: string;
  description: string;
}

interface ComplaintState {
  complaints: Complaint[];
  loading: boolean;

  getComplaints: () => Promise<void>;
  createComplaint: (payload: CreateComplaintPayload) => Promise<Complaint>;
  updateComplaintStatus: (complaintId: string, status: ComplaintStatus) => Promise<Complaint>;
  deleteComplaint: (complaintId: string) => Promise<void>;
  clear: () => void;
}

export const useComplaintStore = create<ComplaintState>((set) => ({
  complaints: [],
  loading: false,

  getComplaints: async () => {
    set({ loading: true });

    try {
      const { data } = await api.get("/complaints");
      set({ complaints: data.complaints ?? [] });
    } finally {
      set({ loading: false });
    }
  },

  createComplaint: async (payload) => {
    set({ loading: true });

    try {
      const { data } = await api.post("/complaints", payload);
      const complaint = data.complaint;
      set((state) => ({ complaints: [complaint, ...state.complaints] }));
      return complaint;
    } finally {
      set({ loading: false });
    }
  },

  updateComplaintStatus: async (complaintId, status) => {
    set({ loading: true });

    try {
      const { data } = await api.patch(`/complaints/${complaintId}/status`, { status });
      const complaint = data.complaint;

      set((state) => ({
        complaints: state.complaints.map((item) => (item._id === complaintId ? complaint : item)),
      }));

      return complaint;
    } finally {
      set({ loading: false });
    }
  },

  deleteComplaint: async (complaintId) => {
    set({ loading: true });

    try {
      await api.delete(`/complaints/${complaintId}`);
      set((state) => ({ complaints: state.complaints.filter((item) => item._id !== complaintId) }));
    } finally {
      set({ loading: false });
    }
  },

  clear: () => set({ complaints: [], loading: false }),
}));
