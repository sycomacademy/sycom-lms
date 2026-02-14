"use client";

import { AnchoredToastProvider, ToastProvider } from "@/components/ui/toast";
import { TRPCReactProvider } from "@/packages/trpc/client";
import { KeyboardShortcuts } from "./layout/keyboard-shortcuts";
import { ThemeProvider } from "./layout/theme-provider";
import { TooltipProvider } from "./ui/tooltip";

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
          <AnchoredToastProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </AnchoredToastProvider>
        </ToastProvider>
        <KeyboardShortcuts />
      </ThemeProvider>
      {/* <ReactQueryDevtools /> */}
    </TRPCReactProvider>
  );
}
