
export interface MetaTags {
  title: string;
  description: string;
  url: string;
  keywords: string;
  author: string;
  themeColor: string;
  robots: string;
  viewport: string;
  ogTitle: string;
  ogDesc: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
}

export const defaultMetaTags: MetaTags = {
  title: '',
  description: '',
  url: '',
  keywords: '',
  author: '',
  themeColor: '#ffffff',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
  ogTitle: '',
  ogDesc: '',
  ogImage: '',
  ogType: 'website',
  twitterCard: 'summary_large_image'
};

export function validateLength(text: string, min: number, max: number): 'perfect' | 'tooShort' | 'tooLong' | 'ok' | 'missing' {
  if (!text) return 'missing';
  if (text.length < min) return 'tooShort';
  if (text.length > max) return 'tooLong';
  if (text.length >= min && text.length <= max) return 'perfect';
  return 'ok';
}

export function generateHtml(tags: MetaTags): string {
  const parts = [
    `<!-- Primary Meta Tags -->`,
    `<title>${tags.title}</title>`,
    `<meta name="title" content="${tags.title}" />`,
    `<meta name="description" content="${tags.description}" />`,
    `<meta name="viewport" content="${tags.viewport}" />`,
    `<meta name="robots" content="${tags.robots}" />`,
    `<meta name="theme-color" content="${tags.themeColor}" />`,
    tags.keywords ? `<meta name="keywords" content="${tags.keywords}" />` : '',
    tags.author ? `<meta name="author" content="${tags.author}" />` : '',
    tags.url ? `<link rel="canonical" href="${tags.url}" />` : '',
    ``,
    `<!-- Open Graph / Facebook -->`,
    `<meta property="og:type" content="${tags.ogType}" />`,
    `<meta property="og:url" content="${tags.url}" />`,
    `<meta property="og:title" content="${tags.ogTitle || tags.title}" />`,
    `<meta property="og:description" content="${tags.ogDesc || tags.description}" />`,
    `<meta property="og:image" content="${tags.ogImage}" />`,
    ``,
    `<!-- Twitter -->`,
    `<meta property="twitter:card" content="${tags.twitterCard}" />`,
    `<meta property="twitter:url" content="${tags.url}" />`,
    `<meta property="twitter:title" content="${tags.ogTitle || tags.title}" />`,
    `<meta property="twitter:description" content="${tags.ogDesc || tags.description}" />`,
    `<meta property="twitter:image" content="${tags.ogImage}" />`
  ];

  return parts.filter(line => line !== '').join('\n');
}

export interface JsonLdData {
  type: string;
  name?: string;
  headline?: string;
  description?: string;
  image?: string;
  datePublished?: string;
  authorName?: string;
  url?: string;
}

export function generateJsonLd(data: JsonLdData): string {
  let schema: any = {
    "@context": "https://schema.org"
  };

  if (data.type === 'Article') {
    schema = {
      ...schema,
      "@type": "Article",
      "headline": data.headline,
      "image": data.image ? [data.image] : [],
      "datePublished": data.datePublished,
      "author": [{
          "@type": "Person",
          "name": data.authorName
      }]
    };
  } else if (data.type === 'Website') {
    schema = {
      ...schema,
      "@type": "WebSite",
      "name": data.name,
      "url": data.url
    };
  } else if (data.type === 'Product') {
    schema = {
      ...schema,
      "@type": "Product",
      "name": data.name,
      "description": data.description,
      "image": data.image
    };
  }

  return JSON.stringify(schema, null, 2);
}

export function parseHtml(html: string): Partial<MetaTags> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const tags: Partial<MetaTags> = {};

  const getMeta = (name: string) => doc.querySelector(`meta[name="${name}"]`)?.getAttribute('content') || '';
  const getProp = (prop: string) => doc.querySelector(`meta[property="${prop}"]`)?.getAttribute('content') || '';

  tags.title = doc.querySelector('title')?.textContent || getProp('og:title') || '';
  tags.description = getMeta('description') || getProp('og:description');
  tags.keywords = getMeta('keywords');
  tags.author = getMeta('author');
  tags.themeColor = getMeta('theme-color');
  tags.robots = getMeta('robots');
  tags.viewport = getMeta('viewport');

  tags.ogTitle = getProp('og:title');
  tags.ogDesc = getProp('og:description');
  tags.ogImage = getProp('og:image');
  tags.ogType = getProp('og:type');

  tags.twitterCard = getProp('twitter:card');

  // Try to find canonical
  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
  if (canonical) tags.url = canonical;
  else tags.url = getProp('og:url');

  return tags;
}
