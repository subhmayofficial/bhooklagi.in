import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminState {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      theme: "dark",
      toggleTheme: () => set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
    }),
    {
      name: "admin-theme-storage",
    }
  )
);
