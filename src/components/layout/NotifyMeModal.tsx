"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BellRing, CheckCircle2 } from "lucide-react";

interface NotifyMeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotifyMeModal({ isOpen, onClose }: NotifyMeModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/kitchen-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Failed to subscribe.");

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setName("");
        setPhone("");
        onClose();
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                    <BellRing className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-extrabold text-gray-900">Notify Me When Open</h3>
                    <p className="text-[11px] text-gray-500">We will alert you immediately!</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Name (Optional)</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] text-gray-900 focus:border-brand-orange focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">WhatsApp / Mobile No.</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] text-gray-900 focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                </div>

                {error && <p className="text-[11px] font-semibold text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-brand-orange py-3 text-[13px] font-extrabold text-white shadow-md shadow-brand-orange/20 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? "Subscribing..." : "Notify Me!"}
                </button>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
