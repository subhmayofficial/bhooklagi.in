"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSettingsStore } from "@/stores/settings-store";
import { NotifyMeModal } from "./NotifyMeModal";
import { BellRing, Clock3 } from "lucide-react";

export function KitchenStatusBanner() {
  const { settings, fetchSettings } = useSettingsStore();
  const [modalOpen, setModalOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isHome = pathname === "/" || pathname === "/home";

  useEffect(() => {
    if (!isAdmin) fetchSettings(true);
  }, [fetchSettings, isAdmin]);

  useEffect(() => {
    if (isAdmin) return;
    const timer = window.setInterval(() => fetchSettings(true), 45000);
    return () => window.clearInterval(timer);
  }, [fetchSettings, isAdmin]);

  if (isAdmin || !settings || settings.kitchen_open) return null;

  return (
    <>
      <div className={`relative z-[790] flex items-center justify-center gap-2 bg-gradient-to-r from-red-700 via-red-600 to-brand-orange px-3 py-2.5 text-center text-[12px] font-bold text-white shadow-lg ${isHome ? "" : "mt-[60px]"}`}>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15">
          <Clock3 className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <span className="leading-snug">
          Kitchen is closed right now.{settings.next_open_time ? ` Opens at ${settings.next_open_time}.` : " Orders are paused until we reopen."}
        </span>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[10px] font-extrabold text-red-600 shadow-sm transition-all hover:bg-white/90 active:scale-95"
        >
          <BellRing className="h-3 w-3" />
          Notify Me
        </button>
      </div>

      <NotifyMeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
