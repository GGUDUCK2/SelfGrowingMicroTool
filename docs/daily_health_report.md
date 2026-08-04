### [Daily Improvement Report - 2023-10-25]
#### 1. Identified Issues (발견된 문제)
- FAQPage JSON-LD schemas were manually defined and injected in multiple tool pages (`+page.svelte`), causing duplicate schemas because the `FAQSection` component automatically handles injecting the `FAQPage` JSON-LD schema.

#### 2. Key Changes (주요 수정 사항)
- **Code**: `src/routes/[lang]/tools/*/+page.svelte` (26 files) - Removed duplicate `@type: "FAQPage"` definitions from JSON-LD schema objects (`jsonLd2`, custom strings, or `@graph` arrays) and removed the corresponding `{@html}` tags that injected them.
- **SEO/AEO**: Ensured each tool page relying on `FAQSection` has a single, valid, automatically injected FAQ schema, preventing search engine confusion.

#### 3. Performance Impact (기대 효과)
- Resolves schema validation errors and avoids duplicate markup penalties.
- Keeps HTML lighter and improves SEO clarity.
