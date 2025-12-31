import { MetadataRoute } from "next";

import registry from "@/lib/registry.json";

/**
 * 사이트 도메인 URL
 * 환경 변수로 설정하거나 기본값 사용
 */
const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://selfgrowingmicrotool.com";

const locales = ["en", "ko"] as const;

/**
 * Next.js 공식 Sitemap 생성 함수
 *
 * Google Search Console 등록용 sitemap.xml을 동적으로 생성합니다.
 * /sitemap.xml 경로에서 자동으로 서빙됩니다.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const currentDate = new Date();

    // 다국어 홈페이지 URL
    const homePages: MetadataRoute.Sitemap = locales.map((locale) => ({
        url: `${BASE_URL}/${locale}`,
        lastModified: currentDate,
        changeFrequency: "weekly",
        priority: 1.0,
    }));

    // 도구 상세 페이지 URL
    const toolPages: MetadataRoute.Sitemap = registry.flatMap((tool) =>
        locales.map((locale) => ({
            url: `${BASE_URL}/${locale}/tools/${tool.slug}`,
            lastModified: new Date(tool.createdAt),
            changeFrequency: "monthly" as const,
            priority: 0.8,
        }))
    );

    return [...homePages, ...toolPages];
}
