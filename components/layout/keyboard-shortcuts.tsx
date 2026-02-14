"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useState } from "react";
import { authClient } from "@/packages/auth/auth-client";
import { useKeyboard } from "@/packages/hooks/use-keyboard";

const MAC_ICONS = {
  shift: "⇧",
  ctrl: "⌃",
  alt: "⌥",
  cmd: "⌘",
};

const WIN_ICONS = {
  shift: "⇧",
  ctrl: "Ctrl",
  alt: "Alt",
  cmd: "⊞", // Windows key
};

function getPlatform(): "mac" | "win" {
  if (typeof navigator === "undefined") {
    return "mac";
  }
  const p = (navigator as Navigator & { userAgentData?: { platform: string } })
    .userAgentData?.platform;
  if (p) {
    return p.toLowerCase().includes("mac") ? "mac" : "win";
  }
  return navigator.platform.toLowerCase().includes("mac") ? "mac" : "win";
}

export function useKeyboardShortcutLabels() {
  const [platform, setPlatform] = useState<"mac" | "win">("mac");

  useEffect(() => {
    setPlatform(getPlatform());
  }, []);

  const icons = platform === "mac" ? MAC_ICONS : WIN_ICONS;

  return useMemo(
    () => ({
      TOGGLE_THEME: `${icons.cmd} D`,
      LOGOUT: `${icons.ctrl} L`,
    }),
    [icons.cmd, icons.ctrl]
  );
}

/** @deprecated Use useKeyboardShortcutLabels() for correct platform-specific labels */
export const KEYBOARD_SHORTCUTS = {
  TOGGLE_THEME: `${MAC_ICONS.cmd} D`,
  LOGOUT: `${MAC_ICONS.ctrl} L`,
};

export function KeyboardShortcuts() {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();

  const isDashboard =
    typeof pathname === "string" && pathname.startsWith("/dashboard");

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  const handleSignOut = useCallback(() => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          // Refresh invalidates the RSC cache so server components see the logged-out state
          router.refresh();
          router.push("/");
        },
      },
    });
  }, [router]);

  const globalBindings = useMemo(
    () => [
      {
        key: "d",
        meta: true,
        onKey: toggleTheme,
      },
    ],
    [toggleTheme]
  );
  const dashboardBindings = useMemo(
    () => [
      {
        key: "l",
        ctrl: true,
        onKey: handleSignOut,
      },
    ],
    [handleSignOut]
  );

  useKeyboard({ bindings: globalBindings });
  useKeyboard({ bindings: dashboardBindings, enabled: isDashboard });

  return null;
}
