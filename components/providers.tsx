"use client";

// import { queryClient } from "@/packages/trpc/client";

import { ThemeProvider } from "./layout/theme-provider";
import { Toaster } from "./ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
    >
      {/* <QueryClientProvider client={queryClient}> */}
      {children}
      {/* <ReactQueryDevtools /> */}
      {/* </QueryClientProvider> */}
      <Toaster richColors />
    </ThemeProvider>
  );
}
