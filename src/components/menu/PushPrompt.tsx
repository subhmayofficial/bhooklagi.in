"use client";

import { useEffect, useState } from "react";

export function PushPrompt() {
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    // We wait 3 seconds to avoid prompting the millisecond they open the menu
    const timer = setTimeout(() => {
      if (!requested && "Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          console.log(`Notification permission: ${permission}`);
          setRequested(true);
        });
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [requested]);

  return null; // This is a headless component, it just triggers the browser popup
}
