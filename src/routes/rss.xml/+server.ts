import registry from '$lib/registry.json';

const BASE_URL = 'https://selfgrowingmicrotool.com';

export async function GET() {
    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Micro-Tools Factory</title>
    <link>${BASE_URL}</link>
    <description>Self-Evolving Web Tools Collection</description>
    <language>en-us</language>
    ${registry.map(tool => `
    <item>
      <title>${tool.title.en}</title>
      <link>${BASE_URL}/en/tools/${tool.slug}</link>
      <description>${tool.description.en}</description>
      <pubDate>${new Date(tool.createdAt).toUTCString()}</pubDate>
      <guid>${BASE_URL}/tools/${tool.slug}</guid>
    </item>
    `).join('')}
  </channel>
</rss>`;

    return new Response(rss, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600'
        }
    });
}
