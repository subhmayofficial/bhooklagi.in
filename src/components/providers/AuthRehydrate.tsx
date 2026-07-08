"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

/** Fetches the current session from the httpOnly cookie once on mount. */
export function AuthRehydrate() {
  useEffect(() => {
    void useAuthStore.getState().refresh();
  }, []);
  return null;
}
