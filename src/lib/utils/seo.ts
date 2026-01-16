
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

export const seoTemplates: Record<string, Partial<MetaTags>> = {
  blog: {
    ogType: 'article',
    twitterCard: 'summary_large_image',
    robots: 'index, follow'
  },
  product: {
    ogType: 'product',
    twitterCard: 'summary_large_image',
    robots: 'index, follow'
  },
  portfolio: {
    ogType: 'website',
    twitterCard: 'summary_large_image',
    robots: 'index, follow'
  },
  landing: {
    ogType: 'website',
    twitterCard: 'summary_large_image',
    robots: 'index, follow'
  }
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
  // New fields
  logo?: string;
  sameAs?: string[];
  breadcrumbs?: { name: string; item: string }[];
  faq?: { question: string; answer: string }[];
}

export function generateJsonLd(data: JsonLdData): string {
  let schema: Record<string, unknown> = {
    "@context": "https://schema.org"
  };

  switch (data.type) {
    case 'Article':
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
      break;
    case 'Website':
      schema = {
        ...schema,
        "@type": "WebSite",
        "name": data.name,
        "url": data.url
      };
      break;
    case 'Product':
      schema = {
        ...schema,
        "@type": "Product",
        "name": data.name,
        "description": data.description,
        "image": data.image
      };
      break;
    case 'Organization':
      schema = {
        ...schema,
        "@type": "Organization",
        "name": data.name,
        "url": data.url,
        "logo": data.logo,
        "sameAs": data.sameAs
      };
      break;
    case 'BreadcrumbList':
      schema = {
        ...schema,
        "@type": "BreadcrumbList",
        "itemListElement": data.breadcrumbs?.map((crumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.name,
          "item": crumb.item
        })) || []
      };
      break;
    case 'FAQPage':
      schema = {
        ...schema,
        "@type": "FAQPage",
        "mainEntity": data.faq?.map(item => ({
          "@type": "Question",
          "name": item.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.answer
          }
        })) || []
      };
      break;
  }

  return JSON.stringify(schema, null, 2);
}

export function parseHtml(html: string): Partial<MetaTags> {
  // Check if we are in a browser environment
  if (typeof window === 'undefined') return {};

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

// Audit Interface
export interface AuditIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  message: string;
  fixAvailable?: boolean;
}

// Keyword extraction (Improved implementation with frequency analysis)
export function extractKeywords(text: string, limit = 5): string[] {
    if (!text) return [];

    // Extended stop words list
    const stopWords = new Set([
        'and', 'the', 'is', 'in', 'at', 'of', 'a', 'an', 'to', 'for', 'on', 'with', 'by', 'as', 'it',
        'this', 'that', 'from', 'or', 'are', 'was', 'be', 'how', 'what', 'why', 'when', 'where', 'which',
        'your', 'you', 'we', 'our', 'us', 'can', 'will', 'do', 'not', 'have', 'has', 'had', 'but', 'so',
        'if', 'then', 'else', 'my', 'mine', 'all', 'any', 'some', 'no', 'yes', 'out', 'up', 'down',
        'about', 'into', 'over', 'after', 'beneath', 'under', 'above'
    ]);

    const words = text.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Keep hyphens, remove other punctuation
        .split(/[\s-]+/) // Split by space or hyphen
        .filter(w => w.length > 2 && !stopWords.has(w));

    // Count frequency
    const freq: Record<string, number> = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);

    // Sort by frequency and then by length (longer is better for SEO usually)
    return Object.entries(freq)
        .sort((a, b) => {
            if (b[1] !== a[1]) return b[1] - a[1];
            return b[0].length - a[0].length;
        })
        .slice(0, limit)
        .map(([w]) => w);
}

export function validateMetaTags(tags: MetaTags): AuditIssue[] {
  const issues: AuditIssue[] = [];

  // Title
  if (!tags.title) {
    issues.push({ id: 'title-missing', severity: 'critical', message: 'Page Title is missing.' });
  } else if (tags.title.length < 30) {
    issues.push({ id: 'title-short', severity: 'warning', message: `Title is too short (${tags.title.length}/30+ chars).` });
  } else if (tags.title.length > 60) {
    issues.push({ id: 'title-long', severity: 'warning', message: `Title is too long (${tags.title.length}/60 chars).`, fixAvailable: true });
  } else {
    issues.push({ id: 'title-ok', severity: 'success', message: 'Title length is perfect.' });
  }

  // Description
  if (!tags.description) {
    issues.push({ id: 'desc-missing', severity: 'critical', message: 'Meta Description is missing.' });
  } else if (tags.description.length < 70) {
    issues.push({ id: 'desc-short', severity: 'warning', message: `Description is too short (${tags.description.length}/70+ chars).` });
  } else if (tags.description.length > 160) {
    issues.push({ id: 'desc-long', severity: 'warning', message: `Description is too long (${tags.description.length}/160 chars).`, fixAvailable: true });
  } else {
    issues.push({ id: 'desc-ok', severity: 'success', message: 'Description length is perfect.' });
  }

  // OG Image
  if (!tags.ogImage) {
    issues.push({ id: 'og-image-missing', severity: 'critical', message: 'Open Graph Image is missing. Your link will look empty on social media.' });
  } else {
    issues.push({ id: 'og-image-ok', severity: 'success', message: 'Open Graph Image is set.' });
  }

  // Canonical
  if (!tags.url) {
    issues.push({ id: 'url-missing', severity: 'warning', message: 'Canonical URL is missing. This is important to prevent duplicate content.' });
  } else if (!tags.url.startsWith('https://')) {
    issues.push({ id: 'url-insecure', severity: 'warning', message: 'URL should start with https:// for better SEO and security.' });
  }

  // Smart Keyword Check
  if (tags.title && tags.description) {
      const titleKeywords = extractKeywords(tags.title);
      const descKeywords = extractKeywords(tags.description);
      const overlap = titleKeywords.filter(k => descKeywords.includes(k));

      if (overlap.length === 0 && titleKeywords.length > 0) {
          issues.push({ id: 'keyword-mismatch', severity: 'info', message: 'Title keywords not found in description. Consider including your main keyword in both.' });
      } else if (overlap.length > 0) {
           issues.push({ id: 'keyword-ok', severity: 'success', message: `Keywords aligned: "${overlap.slice(0, 3).join(', ')}..."` });
      }
  }

  return issues;
}
