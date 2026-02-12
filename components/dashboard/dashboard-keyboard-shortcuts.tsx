"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useMemo } from "react";
import { authClient } from "@/packages/auth/auth-client";
import { useKeyboard } from "@/packages/hooks/use-keyboard";

const KEYBOARD_ICON = {
  SHIFT_MAC: "⇧",
  SHIFT_WIN: "⇧",
  CTRL_MAC: "⌃",
  CTRL_WIN: "⌃",
  ALT_MAC: "⌥",
  ALT_WIN: "⌥",
  CMD_MAC: "⌘",
  CMD_WIN: "⌘",
};

export const KEYBOARD_SHORTCUTS = {
  TOGGLE_THEME: `${KEYBOARD_ICON.CMD_MAC} D`,
  LOGOUT: `${KEYBOARD_ICON.CTRL_MAC} L`,
};

export function DashboardKeyboardShortcuts() {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();

  const enabled =
    typeof pathname === "string" && pathname.startsWith("/dashboard");

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  const handleSignOut = useCallback(() => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  }, [router]);

  const bindings = useMemo(
    () => [
      {
        key: "d",
        meta: true,
        preventDefault: true,
        onKey: toggleTheme,
      },
      {
        key: "l",
        ctrl: true,
        preventDefault: true,
        onKey: handleSignOut,
      },
    ],
    [toggleTheme, handleSignOut]
  );

  useKeyboard({ bindings, enabled });

  return null;
}
