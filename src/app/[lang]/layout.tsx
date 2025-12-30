import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
};

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'ko' }]
}

export default function RootLayout({
  children,
  params: _params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900 min-h-screen`}
      >
        <main className="max-w-4xl mx-auto p-4 md:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
