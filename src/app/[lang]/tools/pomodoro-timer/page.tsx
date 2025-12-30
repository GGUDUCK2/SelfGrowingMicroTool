import { Metadata } from 'next';
import PomodoroTimerClient from './timer-client';
import Link from 'next/link';
import registry from '../../../../lib/registry.json';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
    const { lang } = await params;
    const isKo = lang === 'ko';
    const title = isKo ? '뽀모도로 집중 타이머 | 무료 온라인 생산성 도구' : 'Pomodoro Focus Timer | Free Online Productivity Tool';
    const description = isKo
        ? '25분 집중, 5분 휴식. 효과적인 시간 관리를 위한 무료 온라인 뽀모도로 타이머입니다. 설치 없이 바로 사용하세요.'
        : 'Boost your productivity with this free online Pomodoro Timer. 25 minutes work, 5 minutes break. No installation required.';

    return {
        title,
        description,
        keywords: isKo ? ['뽀모도로', '타이머', '집중', '시간관리', '생산성'] : ['pomodoro', 'timer', 'focus', 'productivity', 'time management'],
        openGraph: {
            title,
            description,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        }
    }
}

export default async function PomodoroTimer({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const isKo = lang === 'ko';

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": isKo ? "뽀모도로 집중 타이머" : "Pomodoro Focus Timer",
        "applicationCategory": "ProductivityApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": isKo
            ? '25분 집중, 5분 휴식. 효과적인 시간 관리를 위한 무료 온라인 뽀모도로 타이머입니다.'
            : 'Boost your productivity with this free online Pomodoro Timer. 25 minutes work, 5 minutes break.',
    };

    // Related tools logic
    const relatedTools = registry.filter(tool => tool.slug !== "pomodoro-timer");

    return (
        <div className="container mx-auto px-4 py-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <PomodoroTimerClient lang={lang} />

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
                                className="group block p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors"
                            >
                                <h3 className="text-lg font-semibold mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
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
