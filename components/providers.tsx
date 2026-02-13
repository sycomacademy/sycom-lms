"use client";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AnchoredToastProvider, ToastProvider } from "@/components/ui/toast";
import { TRPCReactProvider } from "@/packages/trpc/client";
import { KeyboardShortcuts } from "./layout/keyboard-shortcuts";
import { ThemeProvider } from "./layout/theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCReactProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        disableTransitionOnChange
        enableSystem
      >
        <ToastProvider timeout={3000}>
          <AnchoredToastProvider>{children}</AnchoredToastProvider>
        </ToastProvider>
        <KeyboardShortcuts />
      </ThemeProvider>
      <ReactQueryDevtools />
    </TRPCReactProvider>
  );
}
