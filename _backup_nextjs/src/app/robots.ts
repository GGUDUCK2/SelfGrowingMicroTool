import { MetadataRoute } from "next";

/**
 * 사이트 도메인 URL
 */
const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://selfgrowingmicrotool.com";

/**
 * Next.js 공식 Robots 생성 함수
 *
 * 검색 엔진 크롤러 지침을 정의합니다.
 * /robots.txt 경로에서 자동으로 서빙됩니다.
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/api/", "/_next/"],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
