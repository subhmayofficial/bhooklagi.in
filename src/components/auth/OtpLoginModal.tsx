"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Phone, ShieldCheck, User, X } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { getMsg91Config, waitForMsg91, type Msg91WidgetResponse } from "@/lib/msg91/widget";

const PHONE_RE = /^[6-9]\d{9}$/;
const CAPTCHA_ID = "bl-msg91-captcha";
const RESEND_COOLDOWN = 30;
const OTP_LENGTH = 4;

type Step = "phone" | "otp";

export function OtpLoginModal() {
  const open = useAuthStore((s) => s.loginModalOpen);
  const closeLoginModal = useAuthStore((s) => s.closeLoginModal);
  const setUser = useAuthStore((s) => s.setUser);

  const [step, setStep] = useState<Step>("phone");
  const [widgetReady, setWidgetReady] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  function reset() {
    setStep("phone");
    setOtp(Array(OTP_LENGTH).fill(""));
    setError("");
    setSending(false);
    setVerifying(false);
    setResending(false);
    setCooldown(0);
  }

  function handleClose() {
    reset();
    closeLoginModal();
  }

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setWidgetReady(false);

    const config = getMsg91Config({ captchaRenderId: CAPTCHA_ID });
    if (!config) {
      setError("OTP login isn't configured yet.");
      return;
    }

    waitForMsg91()
      .then(() => {
        if (cancelled) return;
        window.initSendOTP?.(config);
        setWidgetReady(true);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load OTP widget. Check your connection and retry.");
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function sendOtp() {
    if (!PHONE_RE.test(phone)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    if (!widgetReady || !window.sendOtp) {
      setError("OTP widget is still loading, try again in a moment.");
      return;
    }
    setError("");
    setSending(true);
    window.sendOtp(
      `91${phone}`,
      () => {
        setSending(false);
        setStep("otp");
        setCooldown(RESEND_COOLDOWN);
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
      },
      (err: Msg91WidgetResponse) => {
        setSending(false);
        setError(err?.message || "Could not send OTP. Try again.");
      },
    );
  }

  function resendOtp() {
    if (cooldown > 0 || !window.retryOtp) return;
    setResending(true);
    setError("");
    window.retryOtp(
      null,
      () => {
        setResending(false);
        setCooldown(RESEND_COOLDOWN);
      },
      (err: Msg91WidgetResponse) => {
        setResending(false);
        setError(err?.message || "Could not resend OTP.");
      },
    );
  }

  function verifyOtp(code: string) {
    if (code.length !== OTP_LENGTH || !window.verifyOtp) return;
    setError("");
    setVerifying(true);
    window.verifyOtp(
      code,
      async (data: Msg91WidgetResponse) => {
        const accessToken = typeof data?.message === "string" ? data.message : "";
        try {
          const res = await fetch("/api/auth/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone, accessToken, name }),
          });
          const payload = await res.json();
          if (!res.ok) throw new Error(payload?.error || "Verification failed.");
          setUser(payload.user);
          handleClose();
        } catch (e) {
          setVerifying(false);
          setError(e instanceof Error ? e.message : "Verification failed.");
        }
      },
      (err: Msg91WidgetResponse) => {
        setVerifying(false);
        setError(err?.message || "Incorrect OTP. Try again.");
      },
    );
  }

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus();
    const joined = next.join("");
    if (joined.length === OTP_LENGTH) verifyOtp(joined);
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setOtp(next);
    otpRefs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
    if (text.length === OTP_LENGTH) verifyOtp(text);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/50 md:items-center"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-t-3xl bg-white p-6 shadow-2xl md:rounded-3xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {step === "otp" && (
                  <button
                    type="button"
                    onClick={() => {
                      setStep("phone");
                      setOtp(Array(OTP_LENGTH).fill(""));
                      setError("");
                    }}
                    className="rounded-full p-1 text-gray-400 hover:text-gray-700"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}
                <h2 className="text-[17px] font-bold text-gray-900">
                  {step === "phone" ? "Log in to order" : "Enter OTP"}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {step === "phone" ? (
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-gray-500">
                    <User className="h-3.5 w-3.5" />
                    Name (optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-gray-500">
                    <Phone className="h-3.5 w-3.5" />
                    Mobile number *
                  </label>
                  <div className="flex">
                    <span className="flex items-center rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 px-3 text-[14px] font-semibold text-gray-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, ""));
                        setError("");
                      }}
                      placeholder="10-digit number"
                      className="flex-1 rounded-r-xl border border-gray-200 px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                    />
                  </div>
                </div>

                <div id={CAPTCHA_ID} />

                {error && <p className="text-[12px] text-red-500">{error}</p>}

                <motion.button
                  type="button"
                  onClick={sendOtp}
                  disabled={sending || !widgetReady}
                  whileTap={{ scale: 0.98 }}
                  className="mt-2 flex w-full items-center justify-center rounded-2xl bg-brand-orange px-5 py-3.5 text-[14px] font-extrabold text-white shadow-[0_8px_24px_rgba(232,93,4,0.35)] transition-all hover:bg-brand-orange-dark disabled:opacity-60"
                >
                  {sending ? "Sending OTP…" : "Send OTP"}
                </motion.button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-[13px] text-gray-500">
                  Sent to <span className="font-semibold text-gray-800">+91 {phone}</span>
                </p>

                <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        otpRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="h-14 w-14 rounded-xl border border-gray-200 text-center text-[20px] font-bold text-gray-900 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                    />
                  ))}
                </div>

                {error && <p className="text-[12px] text-red-500">{error}</p>}

                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={cooldown > 0 || resending}
                  className="text-[12px] font-semibold text-brand-orange disabled:text-gray-400"
                >
                  {cooldown > 0 ? `Resend OTP in ${cooldown}s` : resending ? "Resending…" : "Resend OTP"}
                </button>

                <motion.button
                  type="button"
                  onClick={() => verifyOtp(otp.join(""))}
                  disabled={verifying || otp.join("").length !== OTP_LENGTH}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-orange px-5 py-3.5 text-[14px] font-extrabold text-white shadow-[0_8px_24px_rgba(232,93,4,0.35)] transition-all hover:bg-brand-orange-dark disabled:opacity-60"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {verifying ? "Verifying…" : "Verify & continue"}
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
