"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Share, ChevronRight, Check, AlertCircle } from "lucide-react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const DISMISS_KEY = "bl_push_prompt_dismissed_v2";
const PROMPT_DELAY_MS = 3000;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function getServiceWorkerRegistration() {
  if (!navigator.serviceWorker.controller) {
    await navigator.serviceWorker.register("/sw.js");
  }
  return navigator.serviceWorker.ready;
}

export function PushPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [permissionState, setPermissionState] = useState<string>("default");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const ensureSubscriptionSaved = useCallback(async () => {
    if (!VAPID_PUBLIC_KEY) {
      setError("Notification setup is missing. Please try again later.");
      return false;
    }

    const reg = await getServiceWorkerRegistration();
    const existingSub = await reg.pushManager.getSubscription();
    const subscription = existingSub ?? await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription }),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      throw new Error(payload?.error || "Could not save notification permission.");
    }

    return true;
  }, []);

  const registerSubscriptionSilently = useCallback(async () => {
    try {
      await ensureSubscriptionSaved();
    } catch (e) {
      console.warn("Silent push subscription check failed:", e);
    }
  }, [ensureSubscriptionSaved]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check device types and standalone status
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(iosDevice);

    const standaloneMode =
      ("standalone" in window.navigator && (window.navigator as Navigator & { standalone?: boolean }).standalone) ||
      window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(!!standaloneMode);

    // If notifications are not supported, do not show prompt
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      return;
    }

    setPermissionState(Notification.permission);

    // If permission is already granted, verify subscription registration silently
    if (Notification.permission === "granted") {
      registerSubscriptionSilently();
      return;
    }

    // Check localStorage if they dismissed it recently to avoid spamming
    const dismissedTime = localStorage.getItem(DISMISS_KEY);
    if (dismissedTime) {
      const diff = Date.now() - parseInt(dismissedTime, 10);
      // Wait 3 days before showing it again if they dismissed it
      if (diff < 3 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Show prompt after a short delay
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, PROMPT_DELAY_MS);

    return () => clearTimeout(timer);
  }, [registerSubscriptionSilently]);

  async function handleEnablePush() {
    setLoading(true);
    setError("");
    try {
      // Request permission
      const permission = await Notification.requestPermission();
      setPermissionState(permission);

      if (permission === "granted") {
        const saved = await ensureSubscriptionSaved();
        if (saved) {
          setSuccess(true);
          setTimeout(() => {
            setShowPrompt(false);
          }, 1600);
        }
      } else if (permission === "denied") {
        setError("Notifications are blocked in browser settings.");
        setTimeout(() => setShowPrompt(false), 1400);
      } else {
        setShowPrompt(false);
      }
    } catch (err) {
      console.error("Error subscribing to web push:", err);
      setError(err instanceof Error ? err.message : "Could not enable alerts. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setShowPrompt(false);
  }

  // If permission is already granted and we are not in success transition, hide
  if (permissionState === "granted" && !success) return null;
  // If denied, hide
  if (permissionState === "denied") return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.98 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="fixed bottom-[92px] left-3 right-3 z-[920] mx-auto max-w-md overflow-hidden rounded-3xl border border-brand-orange/20 bg-white p-4 shadow-[0_16px_50px_rgba(15,23,42,0.22)] backdrop-blur-xl dark:border-brand-orange/10 dark:bg-gray-900 md:bottom-8"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
              <Bell className="h-5 w-5" strokeWidth={2.5} />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-[14px] font-extrabold text-gray-900 dark:text-white">
                {success ? "Order Alerts Enabled! 🎉" : "Never Miss Your Hot Meal!"}
              </h3>
              <p className="mt-0.5 text-[12px] leading-relaxed text-gray-600 dark:text-gray-400">
                {success
                  ? "We'll send push notifications for order confirmations and direct updates."
                  : isIos && !isStandalone
                  ? "Receive hot deals and tracking updates. Since you are on iPhone, please install the app to enable alerts."
                  : "Enable push notifications to get live order tracking updates & exclusive discount announcements."}
              </p>

              {/* iOS Manual instructions when NOT running inside standalone PWA mode */}
              {isIos && !isStandalone && (
                <div className="mt-3 flex flex-col gap-2.5 rounded-xl bg-white p-3 text-[11px] font-medium text-gray-700 shadow-sm border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700/50 dark:text-gray-300">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase text-brand-orange">
                    <span>iOS setup guide</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-gray-100 text-[10px] font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">1</span>
                    <span className="flex items-center gap-1">
                      Tap the <span className="inline-flex items-center bg-gray-50 border border-gray-200 px-1 rounded font-bold dark:bg-gray-800 dark:border-gray-700">Share <Share className="h-3 w-3 ml-1" /></span> icon at the bottom of Safari.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-gray-100 text-[10px] font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">2</span>
                    <span>Scroll down and tap <span className="font-extrabold text-gray-900 dark:text-white">Add to Home Screen</span>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-gray-100 text-[10px] font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">3</span>
                    <span>Open the app from your home screen and click <span className="font-bold text-brand-orange">Enable Alerts</span>!</span>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {(!isIos || isStandalone) && !success && (
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={handleEnablePush}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-orange px-3.5 py-1.5 text-[12px] font-bold text-white shadow-sm hover:bg-brand-orange-light active:scale-95 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    )}
                    Enable Alerts
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-[12px] font-bold text-gray-600 hover:bg-gray-50 active:scale-95 transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    Later
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-600 dark:bg-red-950/30 dark:text-red-300">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {error}
                </div>
              )}
            </div>

            {/* Top Close icon */}
            <button
              onClick={handleDismiss}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
