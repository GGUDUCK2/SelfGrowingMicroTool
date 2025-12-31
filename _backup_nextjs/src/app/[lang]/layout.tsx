import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  title: "Micro-Tools Factory",
  description: "Self-Evolving Web Tools",
  verification: {
    google: "0NXsXGlhJH7ejTyAzu0XyLDGmN0Yu6ZlMcfR1HA4ZZs",
  },
};

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'ko' }]
}

export default async function LangLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

  return (
    <>
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        {children}
      </main>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </>
  );
}

