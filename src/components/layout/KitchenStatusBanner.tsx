"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/stores/settings-store";
import { NotifyMeModal } from "./NotifyMeModal";
import { BellRing } from "lucide-react";

export function KitchenStatusBanner() {
  const { settings, fetchSettings } = useSettingsStore();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (!settings || settings.kitchen_open) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-red-600 to-brand-orange py-2 px-4 text-center text-white text-[12px] font-bold shadow-md relative z-[790] mt-[60px] md:mt-[60px] flex items-center justify-center gap-2">
        <span>🏪 Deoghar Kitchen is currently CLOSED. We are not accepting orders.</span>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-extrabold hover:bg-white/35 active:scale-95 transition-all flex items-center gap-1"
        >
          <BellRing className="h-3 w-3" />
          Notify Me
        </button>
      </div>

      <NotifyMeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
