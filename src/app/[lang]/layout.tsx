import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Micro-Tools Factory",
  description: "Self-Evolving Web Tools",
  verification: {
    google: "0NXsXGlhJH7ejTyAzu0XyLDGmN0Yu6ZlMcfR1HA4ZZs",
  },
  openGraph: {
    type: 'website',
    siteName: 'Micro-Tools Factory',
    title: 'Micro-Tools Factory',
    description: 'Self-Evolving Web Tools for Productivity and Finance',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Micro-Tools Factory',
    description: 'Self-Evolving Web Tools for Productivity and Finance',
  }
};

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'ko' }]
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

  return (
    <html lang={lang} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 min-h-screen flex flex-col`}
      >
        <Navbar lang={lang} />
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
          {children}
        </main>
        <Footer lang={lang} />
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
