"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIosPrompt, setIsIosPrompt] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("Service Worker registered.", reg))
        .catch((err) => console.error("Service Worker registration failed.", err));
    }

    // Check if device is iOS and not already installed
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isStandalone = ('standalone' in window.navigator) && (window.navigator as any).standalone;
    
    if (isIos && !isStandalone) {
      setIsIosPrompt(true);
      setTimeout(() => setShow(true), 3000);
    }

    // Listen for standard PWA Install Prompt (Android/Desktop)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsIosPrompt(false);
      setTimeout(() => setShow(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIosPrompt) {
      // On iOS, we just dismiss the prompt because they have to use the share menu manually
      setShow(false);
      return;
    }
    
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-[80px] md:bottom-6 left-0 right-0 z-50 mx-auto w-[90%] max-w-sm overflow-hidden rounded-2xl bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-brand-orange/20"
        >
          <button
            onClick={() => setShow(false)}
            className="absolute right-2 top-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10">
              <Image src="/favicon_io/apple-touch-icon.png" alt="Logo" width={32} height={32} className="rounded-lg" />
            </div>
            <div className="flex-1">
              <h3 className="text-[14px] font-bold text-gray-900">Add Bhook Lagi to Home Screen</h3>
              <p className="text-[12px] text-gray-500">Order faster & get exclusive offers!</p>
            </div>
          </div>
          
          {isIosPrompt ? (
            <div className="mt-4 flex flex-col gap-2 rounded-lg bg-gray-50 p-3 text-[12px] text-gray-600 border border-gray-100">
              <p className="flex items-center gap-2">
                1. Tap the <span className="font-bold flex items-center bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">Share <Download className="h-3 w-3 ml-1" /></span> icon at the bottom.
              </p>
              <p className="flex items-center gap-2">
                2. Scroll down and tap <span className="font-bold">Add to Home Screen</span>.
              </p>
            </div>
          ) : (
            <button
              onClick={handleInstallClick}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-orange py-2.5 text-[14px] font-bold text-white shadow-md shadow-brand-orange/20 active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              Install App
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
