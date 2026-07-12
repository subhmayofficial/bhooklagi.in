"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { MenuItem } from "@/data/menu";

export type CartLine = {
  customLineId: string; // unique ID representing itemId + sorted addon IDs
  itemId: string;
  name: string;
  unitPrice: number;
  qty: number;
  emoji: string;
  image?: string;
  diet?: string;
  selectedAddons?: { id: string; name: string; price: number }[];
};

type CartLineInput = Omit<CartLine, "customLineId"> & { customLineId?: string };

type CartState = {
  lines: CartLine[];
  addItem: (item: MenuItem, qty?: number, selectedAddons?: { id: string; name: string; price: number }[]) => void;
  increment: (customLineId: string) => void;
  decrement: (customLineId: string) => void;
  remove: (customLineId: string) => void;
  replaceLines: (lines: CartLineInput[]) => void;
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
      addItem: (item, qty = 1, selectedAddons = []) => {
        const lines = get().lines;

        // Generate a unique line ID based on item ID and selected addons
        const addonKeys = [...selectedAddons].map((a) => a.id).sort().join("-");
        const customLineId = addonKeys ? `${item.id}-${addonKeys}` : item.id;

        // Calculate the base unit price including addons
        const basePrice = item.price;
        const addonsPrice = selectedAddons.reduce((sum, a) => sum + a.price, 0);
        const finalUnitPrice = basePrice + addonsPrice;

        const existing = lines.find((l) => l.customLineId === customLineId);
        if (existing) {
          set({
            lines: lines.map((l) =>
              l.customLineId === customLineId ? { ...l, qty: l.qty + qty } : l,
            ),
          });
        } else {
          set({
            lines: [
              ...lines,
              {
                customLineId,
                itemId: item.id,
                name: item.name,
                unitPrice: finalUnitPrice,
                qty,
                emoji: item.emoji,
                image: item.image,
                diet: item.diet,
                selectedAddons,
              },
            ],
          });
        }
      },
      increment: (customLineId) => {
        set({
          lines: get().lines.map((l) =>
            l.customLineId === customLineId ? { ...l, qty: l.qty + 1 } : l,
          ),
        });
      },
      decrement: (customLineId) => {
        const lines = get().lines
          .map((l) =>
            l.customLineId === customLineId ? { ...l, qty: l.qty - 1 } : l,
          )
          .filter((l) => l.qty > 0);
        set({ lines });
      },
      remove: (customLineId) => {
        set({ lines: get().lines.filter((l) => l.customLineId !== customLineId) });
      },
      replaceLines: (lines) => set({
        lines: lines
          .filter((line) => line.qty > 0)
          .map((line) => ({
            ...line,
            customLineId: line.customLineId ?? line.itemId,
          })),
      }),
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
