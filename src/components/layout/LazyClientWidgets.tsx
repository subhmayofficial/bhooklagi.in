"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const OtpLoginModal = dynamic(() =>
  import("@/components/auth/OtpLoginModal").then((mod) => mod.OtpLoginModal),
  { ssr: false },
);
const RatingPopup = dynamic(() =>
  import("@/components/layout/RatingPopup").then((mod) => mod.RatingPopup),
  { ssr: false },
);
const InstallPrompt = dynamic(() =>
  import("@/components/layout/InstallPrompt").then((mod) => mod.InstallPrompt),
  { ssr: false },
);

export function LazyClientWidgets() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 1200);
    return () => window.clearTimeout(id);
  }, []);

  if (!ready) return null;

  return (
    <>
      <InstallPrompt />
      <OtpLoginModal />
      <RatingPopup />
    </>
  );
}
