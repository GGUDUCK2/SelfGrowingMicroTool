import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

/**
 * 루트 레이아웃
 *
 * Next.js App Router에서 모든 페이지의 기본 HTML 구조를 정의합니다.
 * 메타데이터 파일(sitemap.ts, robots.ts)이 루트 레벨에서 인식되도록 합니다.
 */
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900 min-h-screen`}
            >
                {children}
            </body>
        </html>
    );
}
