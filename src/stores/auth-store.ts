"use client";

import { create } from "zustand";

export type AuthUser = {
  customerId: string;
  phone: string;
  name: string | null;
};

type AuthState = {
  user: AuthUser | null;
  status: "loading" | "authenticated" | "guest";
  loginModalOpen: boolean;
  setUser: (user: AuthUser | null) => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  openLoginModal: () => void;
  closeLoginModal: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "loading",
  loginModalOpen: false,
  setUser: (user) => set({ user, status: user ? "authenticated" : "guest" }),
  refresh: async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      set({ user: data.user ?? null, status: data.user ? "authenticated" : "guest" });
    } catch {
      set({ user: null, status: "guest" });
    }
  },
  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    set({ user: null, status: "guest" });
  },
  openLoginModal: () => set({ loginModalOpen: true }),
  closeLoginModal: () => set({ loginModalOpen: false }),
}));
