"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AnchoredToastProvider, ToastProvider } from "@/components/ui/toast";
import { TRPCReactProvider } from "@/packages/trpc/client";
import { AuthEventsProvider } from "./auth/auth-events-provider";
import { KeyboardShortcuts } from "./layout/keyboard-shortcuts";
import { ThemeProvider } from "./layout/theme-provider";
import { TooltipProvider } from "./ui/tooltip";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <TRPCReactProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
          enableSystem
        >
          <ToastProvider timeout={3000}>
            <AnchoredToastProvider>
              <TooltipProvider>
                <AuthEventsProvider />
                {children}
              </TooltipProvider>
            </AnchoredToastProvider>
          </ToastProvider>
          <KeyboardShortcuts />
        </ThemeProvider>
      </TRPCReactProvider>
    </NuqsAdapter>
  );
}
