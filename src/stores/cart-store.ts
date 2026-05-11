"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { MenuItem } from "@/data/menu";

export type CartLine = {
  itemId: string;
  name: string;
  unitPrice: number;
  qty: number;
  emoji: string;
};

type CartState = {
  lines: CartLine[];
  addItem: (item: MenuItem, qty?: number) => void;
  increment: (itemId: string) => void;
  decrement: (itemId: string) => void;
  remove: (itemId: string) => void;
  clear: () => void;
};

function totalQty(lines: CartLine[]) {
  return lines.reduce((s, l) => s + l.qty, 0);
}

function totalRs(lines: CartLine[]) {
  return lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      addItem: (item, qty = 1) => {
        const lines = get().lines;
        const existing = lines.find((l) => l.itemId === item.id);
        if (existing) {
          set({
            lines: lines.map((l) =>
              l.itemId === item.id ? { ...l, qty: l.qty + qty } : l,
            ),
          });
        } else {
          set({
            lines: [
              ...lines,
              {
                itemId: item.id,
                name: item.name,
                unitPrice: item.price,
                qty,
                emoji: item.emoji,
              },
            ],
          });
        }
      },
      increment: (itemId) => {
        set({
          lines: get().lines.map((l) =>
            l.itemId === itemId ? { ...l, qty: l.qty + 1 } : l,
          ),
        });
      },
      decrement: (itemId) => {
        const lines = get().lines
          .map((l) =>
            l.itemId === itemId ? { ...l, qty: l.qty - 1 } : l,
          )
          .filter((l) => l.qty > 0);
        set({ lines });
      },
      remove: (itemId) => {
        set({ lines: get().lines.filter((l) => l.itemId !== itemId) });
      },
      clear: () => set({ lines: [] }),
    }),
    {
      name: "bhooklagi-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines }),
      /** SSR + client first paint must match; rehydrate after mount in `CartRehydrate`. */
      skipHydration: true,
    },
  ),
);

export function cartTotals(lines: CartLine[]) {
  return { qty: totalQty(lines), subtotal: totalRs(lines) };
}
