import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "preferences";

export type ThemePreference = "system" | "light" | "dark";

export type Preferences = {
  onboarded: boolean;
  theme: ThemePreference;
};

type PreferencesStore = {
  preferences: Preferences;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  setOnboarded: (value: boolean) => Promise<void>;
  setTheme: (theme: ThemePreference) => Promise<void>;
};

const defaultPreferences: Preferences = {
  onboarded: false,
  theme: "system",
};

export const usePreferencesStore = create<PreferencesStore>((set, get) => ({
  preferences: defaultPreferences,
  hydrated: false,

  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      if (stored) {
        set({
          preferences: JSON.parse(stored),
          hydrated: true,
        });
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPreferences));

        set({
          preferences: defaultPreferences,
          hydrated: true,
        });
      }
    } catch {
      set({
        preferences: defaultPreferences,
        hydrated: true,
      });
    }
  },

  setOnboarded: async (value) => {
    const preferences = {
      ...get().preferences,
      onboarded: value,
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));

    set({ preferences });
  },

  setTheme: async (theme: ThemePreference) => {
    const preferences = {
      ...get().preferences,
      theme,
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));

    set({ preferences });
  },
}));
