import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/providers/Providers";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PATJEBZY — Reward Yourself",
  description: "Production-ready inventory management system with role-based access, sales tracking, and real-time dashboards.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PATJEBZY",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col selection:bg-crimson-500/30 selection:text-crimson-200">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#1a2236",
                color: "#e2e8f0",
                border: "1px solid #263049",
                borderRadius: "12px",
                fontSize: "14px",
              },
              success: {
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#1a2236",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#1a2236",
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
