import { create } from "zustand";
import { api } from "@/lib/api";

export interface Amenity {
  _id: string;
  society: string;
  name: string;
  description: string;
  image: string;
  openingTime: string;
  closingTime: string;
  maxDuration: number;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface AmenityBooking {
  _id: string;
  amenity: Amenity;
  resident: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  date?: string;
  startTime: string;
  endTime: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

interface BookAmenityPayload {
  amenity: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface AmenitiesState {
  amenities: Amenity[];
  bookings: AmenityBooking[];

  activeBooking: AmenityBooking | null;

  loading: boolean;
  bookingLoading: boolean;

  getAmenities: () => Promise<void>;
  populateAmenities: () => Promise<void>;
  getBookings: () => Promise<void>;

  bookAmenity: (payload: BookAmenityPayload) => Promise<AmenityBooking>;
  approveBooking: (bookingId: string) => Promise<void>;
  rejectBooking: (bookingId: string) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;

  clear: () => void;
}

export const useAmenitiesStore = create<AmenitiesState>((set, get) => ({
  amenities: [],
  bookings: [],

  activeBooking: null,

  loading: false,
  bookingLoading: false,

  getAmenities: async () => {
    try {
      set({ loading: true });

      const response = await api.get("/amenities/get-amenities");

      set({
        amenities: response.data.data,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  populateAmenities: async () => {
    try {
      set({ loading: true });

      const response = await api.post("/amenities/populate");

      set({
        amenities: response.data.data,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  getBookings: async () => {
    try {
      set({ bookingLoading: true });

      const response = await api.get("/amenities/get-amenity-bookings");

      const bookings: AmenityBooking[] = response.data.data;

      const activeBooking =
        bookings.find((booking) => booking.status === "pending" || booking.status === "approved") ??
        null;

      set({
        bookings,
        activeBooking,
        bookingLoading: false,
      });
    } catch (error) {
      set({ bookingLoading: false });
      throw error;
    }
  },

  bookAmenity: async (payload) => {
    try {
      set({ bookingLoading: true });

      const response = await api.post("/amenities/book", payload);

      await Promise.all([get().getAmenities(), get().getBookings()]);

      set({ bookingLoading: false });

      return response.data.data;
    } catch (error) {
      set({ bookingLoading: false });
      throw error;
    }
  },

  approveBooking: async (bookingId) => {
    try {
      set({ bookingLoading: true });

      await api.patch(`/amenities/approve/${bookingId}`);

      await get().getBookings();

      set({ bookingLoading: false });
    } catch (error) {
      set({ bookingLoading: false });
      throw error;
    }
  },

  rejectBooking: async (bookingId) => {
    try {
      set({ bookingLoading: true });

      await api.patch(`/amenities/reject/${bookingId}`);

      await get().getBookings();

      set({ bookingLoading: false });
    } catch (error) {
      set({ bookingLoading: false });
      throw error;
    }
  },

  cancelBooking: async (bookingId) => {
    try {
      set({ bookingLoading: true });

      await api.patch(`/amenities/cancel/${bookingId}`);

      await get().getBookings();

      set({ bookingLoading: false });
    } catch (error) {
      set({ bookingLoading: false });
      throw error;
    }
  },

  clear: () =>
    set({
      amenities: [],
      bookings: [],
      activeBooking: null,
      loading: false,
      bookingLoading: false,
    }),
}));
