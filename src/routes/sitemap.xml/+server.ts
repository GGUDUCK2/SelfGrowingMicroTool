import registry from '$lib/registry.json';

export const prerender = true;

const BASE_URL = 'https://selfgrowingmicrotool.com';
const LOCALES = ['en', 'ko'];

export async function GET() {
    const currentDate = new Date().toISOString().split('T')[0];
    let urls = [];

    // Home Pages
    for (const locale of LOCALES) {
        urls.push(`
  <url>
    <loc>${BASE_URL}/${locale}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`);
    }

    // Tool Pages
    for (const tool of registry) {
        for (const locale of LOCALES) {
            urls.push(`
  <url>
    <loc>${BASE_URL}/${locale}/tools/${tool.slug}</loc>
    <lastmod>${tool.createdAt}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`);
        }
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}
</urlset>`;

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600'
        }
    });
}
