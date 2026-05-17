"use client";

import { useEffect, useState } from "react";

/**
 * Returns true after the first client-side render. Used to gate UI that
 * depends on browser-only state (localStorage-persisted Zustand stores)
 * so SSR markup matches client hydration markup.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  return mounted;
}
