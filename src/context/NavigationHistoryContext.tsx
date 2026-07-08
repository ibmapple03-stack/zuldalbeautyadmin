"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

interface NavigationHistoryState {
  goBack: (fallbackHref: string) => void;
}

const NavigationHistoryContext = createContext<NavigationHistoryState | undefined>(undefined);

// Browser `window.history.length` counts the whole tab session (including
// pages visited before this app ever loaded), so it can't tell us whether
// there's actually a previous page to return to *within* the admin app.
// This tracks an in-app-only stack of visited routes so "Back" can reliably
// return to wherever the admin actually came from, falling back to a
// specific route (normally the dashboard) only when there's nowhere to go.
export function NavigationHistoryProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const stackRef = useRef<string[]>([]);

  useEffect(() => {
    const stack = stackRef.current;
    if (stack[stack.length - 1] === pathname) return;

    const existingIndex = stack.lastIndexOf(pathname);
    stackRef.current =
      existingIndex !== -1 ? stack.slice(0, existingIndex + 1) : [...stack, pathname];
  }, [pathname]);

  function goBack(fallbackHref: string) {
    const stack = stackRef.current;
    if (stack.length >= 2) {
      const previous = stack[stack.length - 2];
      stackRef.current = stack.slice(0, stack.length - 1);
      router.push(previous);
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <NavigationHistoryContext.Provider value={{ goBack }}>
      {children}
    </NavigationHistoryContext.Provider>
  );
}

export function useNavigationHistory() {
  const ctx = useContext(NavigationHistoryContext);
  if (!ctx) throw new Error("useNavigationHistory must be used within a NavigationHistoryProvider");
  return ctx;
}
