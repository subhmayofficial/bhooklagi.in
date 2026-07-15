"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HomeSectionsClient = dynamic(() =>
  import("@/components/home/HomeSectionsClient").then((mod) => mod.HomeSectionsClient),
  { ssr: false },
);

export function LazyHomeSections() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 300);
    return () => window.clearTimeout(id);
  }, []);

  if (!ready) return null;

  return (
    <HomeSectionsClient />
  );
}
