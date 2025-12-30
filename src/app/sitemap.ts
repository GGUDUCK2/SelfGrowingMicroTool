import { MetadataRoute } from 'next';
import registry from '@/lib/registry.json';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://web-factory.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = ['en', 'ko'];

  const routes = languages.flatMap(lang => {
    // Main page
    const mainPage = {
      url: `${BASE_URL}/${lang}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    };

    // Tool pages
    const toolPages = registry.map(tool => ({
      url: `${BASE_URL}/${lang}/tools/${tool.slug}`,
      lastModified: new Date(tool.createdAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [mainPage, ...toolPages];
  });

  return routes;
}
