"use client";

import { useEffect } from "react";
import { useCartStore } from "@/stores/cart-store";

/** Runs persisted cart restore only on the client after hydration. */
export function CartRehydrate() {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);
  return null;
}
