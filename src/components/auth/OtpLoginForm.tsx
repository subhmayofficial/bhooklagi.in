"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { getMsg91Config, waitForMsg91, type Msg91WidgetResponse } from "@/lib/msg91/widget";

const PHONE_RE = /^[6-9]\d{9}$/;
const CAPTCHA_ID = "bl-msg91-captcha";
const RESEND_COOLDOWN = 30;
const OTP_LENGTH = 4;

type Step = "phone" | "otp";

export function OtpLoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const setUser = useAuthStore((s) => s.setUser);

  const [step, setStep] = useState<Step>("phone");
  const [widgetReady, setWidgetReady] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
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
  }, []);

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
      }
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
      }
    );
  }

  function verifyOtp(code: string) {
    if (code.length !== OTP_LENGTH || !window.verifyOtp) return;
    setError("");
    setVerifying(true);
    window.verifyOtp(
      code,
      async (data: Msg91WidgetResponse) => {
        const raw = data as unknown;
        const accessToken =
          typeof raw === "string"
            ? raw
            : typeof data?.message === "string"
              ? data.message
              : typeof (data as { accessToken?: unknown })?.accessToken === "string"
                ? (data as { accessToken: string }).accessToken
                : typeof (data as { ["access-token"]?: unknown })?.["access-token"] === "string"
                  ? (data as { ["access-token"]: string })["access-token"]
                  : "";

        if (!accessToken) {
          setVerifying(false);
          setError(`OTP verified but no token returned.`);
          return;
        }

        try {
          const res = await fetch("/api/auth/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone, accessToken }),
          });
          const payload = await res.json();
          if (!res.ok) throw new Error(payload?.error || "Verification failed.");
          setUser(payload.user);
          if (onSuccess) onSuccess();
        } catch (e) {
          setVerifying(false);
          setError(e instanceof Error ? e.message : "Verification failed.");
        }
      },
      (err: Msg91WidgetResponse) => {
        setVerifying(false);
        setError(err?.message || "Incorrect OTP. Try again.");
      }
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
    if (e.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
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
    <div className="w-full text-left">
      <div className="flex items-center gap-2.5 mb-5">
        {step === "otp" && (
          <button
            type="button"
            onClick={() => {
              setStep("phone");
              setOtp(Array(OTP_LENGTH).fill(""));
              setError("");
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
          </button>
        )}
        {step === "phone" && (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-orange/10">
            <Sparkles className="h-4 w-4 text-brand-orange" />
          </span>
        )}
        <div>
          <h2 className="text-[16px] font-extrabold text-gray-900">
            {step === "phone" ? "Log in with OTP" : "Verify OTP"}
          </h2>
          <p className="text-[11px] text-gray-400">
            {step === "phone" ? "We'll send a 4-digit code to your number" : `Sent to +91 ${phone}`}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {step === "phone" ? (
          <motion.div
            key="phone"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-widest text-gray-500">
                Mobile number
              </label>
              <div className="flex overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-brand-orange/20 transition-all">
                <span className="flex items-center gap-1.5 border-r border-gray-200 bg-white px-3.5 text-[14px] font-bold text-gray-700">
                  <Phone className="h-3.5 w-3.5 text-gray-400" strokeWidth={2.5} />
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendOtp();
                  }}
                  placeholder="10-digit number"
                  className="flex-1 bg-transparent px-4 py-3.5 text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
                />
              </div>
            </div>

            <div id={CAPTCHA_ID} />

            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-600">
                {error}
              </p>
            )}

            <motion.button
              type="button"
              onClick={sendOtp}
              disabled={sending || !widgetReady || phone.length !== 10}
              whileTap={{ scale: 0.97 }}
              className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-brand-orange to-brand-gold py-4 text-[14px] font-extrabold text-white shadow-[0_8px_24px_rgba(232,93,4,0.35)] transition-all disabled:opacity-50"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              {sending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Sending OTP…
                </span>
              ) : (
                "Get OTP →"
              )}
            </motion.button>

            <p className="text-center text-[10px] leading-relaxed text-gray-500">
              By completing this, you agree to our{" "}
              <a href="/terms" className="text-brand-orange hover:underline font-semibold">Terms & Conditions</a>
              {", "}
              <a href="/privacy-policy" className="text-brand-orange hover:underline font-semibold">Privacy Policy</a>
              {", and "}
              <a href="/refund-policy" className="text-brand-orange hover:underline font-semibold">Refund Policy</a>
              . You also consent to receive order updates and promotional marketing messages via WhatsApp.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.18 }}
            className="space-y-5"
          >
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
                  className={`h-[56px] w-[56px] rounded-2xl border-2 bg-gray-50 text-center text-[22px] font-extrabold text-gray-900 transition-all focus:outline-none ${
                    digit
                      ? "border-brand-orange bg-brand-orange/5 text-brand-orange"
                      : "border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                  }`}
                />
              ))}
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-center text-[12px] font-semibold text-red-600">
                {error}
              </p>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={resendOtp}
                disabled={cooldown > 0 || resending}
                className="text-[12px] font-bold text-brand-orange disabled:text-gray-400 transition-colors"
              >
                {cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : resending
                    ? "Resending…"
                    : "Resend OTP"}
              </button>
            </div>

            <motion.button
              type="button"
              onClick={() => verifyOtp(otp.join(""))}
              disabled={verifying || otp.join("").length !== OTP_LENGTH}
              whileTap={{ scale: 0.97 }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-gold py-4 text-[14px] font-extrabold text-white shadow-[0_8px_24px_rgba(232,93,4,0.35)] disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" strokeWidth={2.5} />
              {verifying ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Verifying…
                </span>
              ) : (
                "Verify & continue"
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
