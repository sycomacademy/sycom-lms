"use client";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AnchoredToastProvider, ToastProvider } from "@/components/ui/toast";
import { TRPCReactProvider } from "@/packages/trpc/client";
import { ThemeProvider } from "./layout/theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCReactProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
        <ToastProvider timeout={3000}>
          <AnchoredToastProvider>{children}</AnchoredToastProvider>
        </ToastProvider>
      </ThemeProvider>
      <ReactQueryDevtools />
    </TRPCReactProvider>
  );
}
