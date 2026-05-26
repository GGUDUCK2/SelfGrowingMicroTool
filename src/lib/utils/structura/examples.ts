export const structuraExamples = [
  {
    label: 'User Profile (JSON)',
    format: 'json',
    data: `{
  "id": "u_12345",
  "name": "Sarah Connor",
  "email": "sarah@resistance.net",
  "roles": ["admin", "editor"],
  "settings": {
    "theme": "dark",
    "notifications": true
  },
  "lastLogin": "2029-08-29T10:00:00Z"
}`
  },
  {
    label: 'Server Config (YAML)',
    format: 'yaml',
    data: `server:
  port: 8080
  host: "0.0.0.0"
database:
  driver: "postgres"
  url: "postgres://user:pass@localhost:5432/db"
  pool:
    max_open: 100
    max_idle: 10
logging:
  level: "info"
  output: "json"
`
  },
  {
    label: 'Product Catalog (CSV)',
    format: 'csv',
    data: `id,name,price,inStock,category
1,Quantum Processor,999.99,true,Hardware
2,Neural Interface,2499.50,false,Peripherals
3,Holographic Display,599.00,true,Monitors
4,Fusion Battery,129.99,true,Accessories
`
  },
  {
    label: 'Sitemap (XML)',
    format: 'xml',
    data: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://selfgrowingmicrotool.com/</loc>
    <lastmod>2025-02-06</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://selfgrowingmicrotool.com/tools/structura</loc>
    <lastmod>2025-02-06</lastmod>
    <priority>0.8</priority>
  </url>
</urlset>
`
  }
];
