"use client";

import { useEffect, useState } from "react";
import { X, BellRing, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

interface NotifyMeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotifyMeModal({ isOpen, onClose }: NotifyMeModalProps) {
  const authStatus = useAuthStore((state) => state.status);
  const openLoginModal = useAuthStore((state) => state.openLoginModal);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (authStatus === "guest") {
      onClose();
      openLoginModal();
      return;
    }

    if (authStatus !== "authenticated") return;

    let cancelled = false;
    setError("");
    setLoading(true);
    setSuccess(false);

    fetch("/api/kitchen-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed to subscribe.");
        if (!cancelled) {
          setSuccess(true);
          window.setTimeout(() => {
            if (!cancelled) onClose();
          }, 1800);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Something went wrong.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authStatus, isOpen, onClose, openLoginModal]);

  if (!isOpen) return null;

  return (
        <>
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div
            className="fixed inset-x-4 bottom-6 z-[10010] mx-auto max-w-sm overflow-hidden rounded-3xl bg-white p-6 shadow-2xl md:top-1/2 md:bottom-auto md:-translate-y-1/2"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            {success ? (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-500 mb-4 animate-bounce">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-[18px] font-extrabold text-gray-900">Successfully Subscribed!</h3>
                <p className="mt-1 text-[13px] text-gray-500 px-4">
                  We will ping you on WhatsApp / SMS the moment our kitchen is fired up and open!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                    <BellRing className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-extrabold text-gray-900">Notify Me When Open</h3>
                    <p className="text-[11px] text-gray-500">We will alert you immediately!</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-orange-50 px-4 py-3 text-[12px] font-semibold text-orange-800">
                  {loading ? "Saving your alert..." : "We will use your logged-in mobile number for the alert."}
                </div>

                {error && <p className="text-[11px] font-semibold text-red-500">{error}</p>}

                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="w-full rounded-xl bg-gray-950 py-3 text-[13px] font-extrabold text-white shadow-md active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? "Please wait..." : "Close"}
                </button>
              </div>
            )}
          </div>
        </>
  );
}
