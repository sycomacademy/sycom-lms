import type { Metadata } from "next";
import { JetBrains_Mono, Work_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "@/components/providers";

const sans = Work_Sans({ subsets: ["latin"], variable: "--font-sans" });

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sycom LMS - Learn Cybersecurity",
  description:
    "Master cybersecurity with hands-on labs, certification prep, and career-focused training. Build real-world security skills through interactive learning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            crossOrigin="anonymous"
            src="//unpkg.com/react-grab/dist/index.global.js"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className={`${sans.variable} ${mono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
