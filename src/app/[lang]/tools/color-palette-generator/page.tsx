import { Metadata } from 'next';
import PaletteClient from './palette-client';
import { content } from './content';
import Link from 'next/link';
import registry from '@/lib/registry.json';

type Props = {
  params: Promise<{ lang: 'en' | 'ko' }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const t = content[lang];
  return {
    title: t.title,
    description: t.description,
    keywords: lang === 'ko'
      ? ['색상 팔레트', '색상 조합', '디자인 도구', '무료 색상 생성기', 'Hex 코드']
      : ['color palette', 'color scheme', 'design tool', 'free color generator', 'hex codes'],
  };
}

export default async function ColorPaletteGenerator({ params }: Props) {
  const { lang } = await params;
  const t = content[lang];

  // Get related tools (simple logic: exclude current, take first 3)
  const relatedTools = registry
    .filter(tool => tool.slug !== 'color-palette-generator')
    .slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <div className="space-y-4 text-center">
        <Link href={`/${lang}`} className="text-sm text-gray-500 hover:underline inline-block">
            &larr; {lang === 'ko' ? '홈으로 돌아가기' : 'Back to Home'}
        </Link>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            {t.title}
          </span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          {t.description}
        </p>
      </div>

      {/* Main Tool */}
      <PaletteClient lang={lang} />

      {/* AEO Content: How to Use */}
      <article className="prose prose-lg max-w-none bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2>{t.howToTitle}</h2>
        <div className="grid md:grid-cols-2 gap-6 not-prose">
          {t.howToSteps.map((step, idx) => (
            <div key={idx} className="flex space-x-4">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold">
                {idx + 1}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <hr className="my-8 border-gray-100" />

        <h2>{t.faqTitle}</h2>
        <div className="space-y-4 not-prose">
            {t.faq.map((item, idx) => (
                <details key={idx} className="group bg-gray-50 rounded-lg p-4 cursor-pointer">
                    <summary className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors list-none flex justify-between items-center">
                        <span>{item.q}</span>
                        <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="mt-2 text-gray-600 leading-relaxed pl-1">{item.a}</p>
                </details>
            ))}
        </div>

        {/* JSON-LD for SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": t.title,
              "description": t.description,
              "applicationCategory": "DesignApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": t.howToSteps.map(s => s.title).join(", ")
            })
          }}
        />

        {/* JSON-LD for FAQ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": t.faq.map(f => ({
                "@type": "Question",
                "name": f.q,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": f.a
                }
              }))
            })
          }}
        />
      </article>

      {/* Related Tools */}
      <section className="border-t border-gray-200 pt-12">
        <h2 className="text-2xl font-bold mb-6">{t.relatedTools}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedTools.map(tool => (
            <Link
                key={tool.slug}
                href={`/${lang}/tools/${tool.slug}`}
                className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
                <div className="text-sm font-medium text-indigo-600 mb-2">{tool.category}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {lang === 'ko' ? tool.title.ko : tool.title.en}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-2">
                    {lang === 'ko' ? tool.description.ko : tool.description.en}
                </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
