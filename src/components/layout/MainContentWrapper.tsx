"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** Reserves space for BottomNav, except on the standalone landing page where it's hidden. */
export function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className={cn(pathname !== "/" && "pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-8")}>
      {children}
    </div>
  );
}
