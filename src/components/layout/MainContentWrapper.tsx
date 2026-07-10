"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** Reserves space for BottomNav, except on the standalone landing page where it's hidden. */
export function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noBottomPad = pathname === "/" || pathname === "/cart" || pathname === "/checkout" || pathname.startsWith("/orders/");
  return (
    <div className={cn(!noBottomPad && "pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-8")}>
      {children}
    </div>
  );
}
