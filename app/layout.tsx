import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "./components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Providers } from "./Providers";

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Pinglyfy | Real-time Service Monitoring",
    template: "%s | Pinglyfy",
  },
  description:
    "Real-time infrastructure monitoring, status pages, and incident alerts for modern dev teams. Monitor your services with confidence.",
  keywords: [
    "uptime monitoring",
    "service monitoring",
    "status page",
    "infrastructure monitoring",
    "incident alerts",
  ],
  authors: [{ name: "Pinglyfy Team" }],
  creator: "Pinglyfy",
  publisher: "Pinglyfy",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "512x512", type: "image/png" }],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Pinglyfy | Real-time Service Monitoring",
    description:
      "Real-time infrastructure monitoring, status pages, and incident alerts for modern dev teams.",
    siteName: "Pinglyfy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pinglyfy | Real-time Service Monitoring",
    description:
      "Real-time infrastructure monitoring, status pages, and incident alerts for modern dev teams.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {gaId && <GoogleAnalytics measurementId={gaId} />}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
