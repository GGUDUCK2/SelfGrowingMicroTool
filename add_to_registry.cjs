const fs = require('fs');
const path = require('path');

const registryPath = path.resolve('src/lib/registry.json');
const routesPath = path.resolve('src/routes/[lang]/tools');

const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const registrySlugs = registry.map(t => t.slug);

const dirs = fs.readdirSync(routesPath).filter(d => fs.statSync(path.join(routesPath, d)).isDirectory());
const missing = dirs.filter(d => !registrySlugs.includes(d));

console.log('Missing tools:', missing);

for (const dir of missing) {
    const pagePath = path.join(routesPath, dir, '+page.svelte');
    if (!fs.existsSync(pagePath)) continue;

    const content = fs.readFileSync(pagePath, 'utf8');

    // Extract category from RelatedTools
    let category = 'dev';
    const catMatch = content.match(/currentCategory="([^"]+)"/);
    if (catMatch) category = catMatch[1];

    // Try to build a basic title from slug
    const titleEn = dir.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    registry.push({
        id: dir,
        slug: dir,
        title: {
            en: titleEn,
            ko: titleEn // will need manual update later or better parsing
        },
        description: {
            en: `Tool for ${titleEn}`,
            ko: `${titleEn} 도구`
        },
        category: category,
        tags: [dir.split('-')[0], "tool"],
        createdAt: new Date().toISOString().split('T')[0]
    });
}

fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
console.log('Registry updated.');
