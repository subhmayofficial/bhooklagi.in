"use client";

import { create } from "zustand";

type StoreSettings = {
  delivery_charge: number;
  free_delivery_threshold: number;
  tax_percent: number;
  upi_discount_enabled: boolean;
  upi_discount_percent: number;
  kitchen_open: boolean;
  next_open_time: string | null;
};

type SettingsState = {
  settings: StoreSettings | null;
  loading: boolean;
  fetchSettings: (force?: boolean) => Promise<StoreSettings | null>;
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  loading: false,
  fetchSettings: async (force = false) => {
    if (!force && get().settings) return get().settings;

    set({ loading: true });
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (res.ok && data?.settings) {
        set({ settings: data.settings, loading: false });
        return data.settings;
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
    set({ loading: false });
    return null;
  },
}));
