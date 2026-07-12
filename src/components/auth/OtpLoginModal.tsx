"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { OtpLoginForm } from "./OtpLoginForm";

export function OtpLoginModal() {
  const open = useAuthStore((s) => s.loginModalOpen);
  const closeLoginModal = useAuthStore((s) => s.closeLoginModal);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/60 backdrop-blur-[3px] md:items-center"
        onClick={closeLoginModal}
      >
        <motion.div
          initial={{ y: 60, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm overflow-hidden rounded-t-[28px] bg-white shadow-2xl md:rounded-[28px]"
        >
          {/* Orange top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-brand-orange to-brand-gold" />

          {/* Close Header */}
          <div className="flex justify-end px-6 pt-5">
            <button
              type="button"
              onClick={closeLoginModal}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 pb-6 pt-2">
            <OtpLoginForm onSuccess={closeLoginModal} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
