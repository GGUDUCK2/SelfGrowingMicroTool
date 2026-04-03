const fs = require('fs');
const path = require('path');

const files = [
  'src/routes/[lang]/tools/banner-forge/+page.svelte',
  'src/routes/[lang]/tools/deploy-forge/+page.svelte',
  'src/routes/[lang]/tools/diagram-forge/+page.svelte',
  'src/routes/[lang]/tools/geo-forge/+page.svelte',
  'src/routes/[lang]/tools/grid-master/+page.svelte',
  'src/routes/[lang]/tools/icon-forge/+page.svelte',
  'src/routes/[lang]/tools/input-lab/+page.svelte',
  'src/routes/[lang]/tools/locale-forge/+page.svelte',
  'src/routes/[lang]/tools/log-prism/+page.svelte',
  'src/routes/[lang]/tools/logic-forge/+page.svelte',
  'src/routes/[lang]/tools/math-forge/+page.svelte',
  'src/routes/[lang]/tools/pdf-forge/+page.svelte',
  'src/routes/[lang]/tools/perms-forge/+page.svelte',
  'src/routes/[lang]/tools/pixel-forge/+page.svelte',
  'src/routes/[lang]/tools/qr-forge/+page.svelte',
  'src/routes/[lang]/tools/regex-tester/+page.svelte',
  'src/routes/[lang]/tools/restro/+page.svelte',
  'src/routes/[lang]/tools/rhythm-forge/+page.svelte',
  'src/routes/[lang]/tools/seo-forge/+page.svelte',
  'src/routes/[lang]/tools/subnet-scope/+page.svelte',
  'src/routes/[lang]/tools/time-forge/+page.svelte',
  'src/routes/[lang]/tools/type-forge/+page.svelte',
  'src/routes/[lang]/tools/unit-verse/+page.svelte',
  'src/routes/[lang]/tools/zen-forge/+page.svelte'
];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');

    // Replace {@html `<script type="application/ld+json"> { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": ... } </script>`}
    // with proper JSON.stringify(faqSchema) if faqItems exists.

    // Check if faqItems exists
    if (content.includes('faqItems =')) {
        if (!content.includes('faqSchema')) {
            const faqSchemaCode = `
  $: faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };`;
            // Insert it before </script>
            content = content.replace('</script>', `${faqSchemaCode}\n</script>`);
        }

        // Remove the old {@html `<script type="application/ld+json">\n  {\n    "@context": "https://schema.org",\n    "@type": "FAQPage" ... dict.q1 ... </script>`}
        const regex = /\{@html\s+`<script\s+type="application\/ld\+json">\s*\{\s*"@context":\s*"https:\/\/schema\.org",\s*"@type":\s*"FAQPage"[\s\S]*?<\/script>`\}/;
        if (regex.test(content)) {
            content = content.replace(regex, `{@html '<script type="application/ld+json">' + JSON.stringify(faqSchema) + '</script>'}`);
        } else {
             // In case it's slightly differently formatted:
             const regex2 = /\{@html\s+`<script\s+type="application\/ld\+json">[\s\S]*?FAQPage[\s\S]*?<\/script>`\}/;
             if (regex2.test(content) && content.match(regex2)[0].includes('dict.')) {
                 content = content.replace(regex2, `{@html '<script type="application/ld+json">' + JSON.stringify(faqSchema) + '</script>'}`);
             }
        }
    }

    fs.writeFileSync(file, content);
}
console.log('Done replacing schemas');
