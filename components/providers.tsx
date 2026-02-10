"use client";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TRPCReactProvider } from "@/packages/trpc/client";
import { Toaster } from "./ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCReactProvider>
      {children}
      <ReactQueryDevtools />
      <Toaster richColors />
    </TRPCReactProvider>
  );
}
