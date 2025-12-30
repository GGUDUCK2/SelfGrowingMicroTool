import type { Metadata } from "next";
import Link from "next/link";
import CalculatorClient from "./calculator-client";
import { content } from "./content";
import registry from "../../../../lib/registry.json";

type Props = {
  params: Promise<{ lang: "en" | "ko" }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const t = content[lang];

  return {
    title: t.title,
    description: t.description,
    keywords: [
        lang === "en" ? "compound interest calculator" : "복리 계산기",
        lang === "en" ? "investment calculator" : "투자 계산기",
        "finance",
        "growth",
        "interest"
    ],
    alternates: {
      canonical: `https://web-factory.demo/${lang}/tools/compound-interest-calculator`,
    },
    openGraph: {
      title: t.title,
      description: t.description,
      type: "website",
    },
  };
}

export default async function Page({ params }: Props) {
  const { lang } = await params;
  const t = content[lang];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": t.title,
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": t.description,
    "featureList": t.howToUse.steps,
  };

  // Filter out the current tool and get related tools
  // For now, just getting other tools since we only have one other
  const relatedTools = registry.filter(tool => tool.slug !== "compound-interest-calculator");

  return (
    <div className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">{t.title}</h1>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">{t.description}</p>
      </div>

      <CalculatorClient lang={lang} />

      {/* Related Tools Section */}
      {relatedTools.length > 0 && (
        <div className="mt-20 border-t border-zinc-200 dark:border-zinc-800 pt-12">
            <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">
                {lang === 'en' ? "Explore More Tools" : "더 많은 도구 살펴보기"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedTools.map((tool) => (
                    <Link
                        key={tool.id}
                        href={`/${lang}/tools/${tool.slug}`}
                        className="group block p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                    >
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {lang === 'en' ? tool.title.en : tool.title.ko}
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {lang === 'en' ? tool.description.en : tool.description.ko}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
