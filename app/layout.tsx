import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Universal Ternary Logic Gates",
  description: "Explore all 3,774 universal operators for ternary (3-valued) logic",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <nav className="bg-white dark:bg-black text-black dark:text-white border-b border-gray-200 dark:border-white/20 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-5">
              <div className="flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  Ternary Logic Gates
                </Link>
                <div className="flex gap-4 items-center">
                  <Link href="/" className="px-5 py-2 hover:bg-gray-100 dark:hover:bg-white/10 transition-all font-medium rounded-lg">
                    Home
                  </Link>
                  <Link href="/gates" className="px-5 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all font-medium border border-gray-300 dark:border-white/20 rounded-lg">
                    All Gates
                  </Link>
                  <ThemeToggleButton />
                </div>
              </div>
            </div>
          </nav>
          {children}
        </Providers>
      </body>
    </html>
  );
}
