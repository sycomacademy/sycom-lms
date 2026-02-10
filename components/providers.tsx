"use client";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TRPCReactProvider } from "@/packages/trpc/client";
import { ThemeProvider } from "./layout/theme-provider";
import { Toaster } from "./ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCReactProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
        {children}
      </ThemeProvider>
      <ReactQueryDevtools />
      <Toaster richColors />
    </TRPCReactProvider>
  );
}
