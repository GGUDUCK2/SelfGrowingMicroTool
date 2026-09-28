1. **Import `RelatedTools` component in `uuid-forge/+page.svelte`**
   - I need to import the `<RelatedTools />` component at the top of the `<script>` section in `src/routes/[lang]/tools/uuid-forge/+page.svelte`.
2. **Add `<RelatedTools />` component to the template**
   - I will add the `<RelatedTools lang={lang as 'en' | 'ko'} currentSlug="uuid-forge" currentCategory="dev" />` component at the bottom of the tool page, just before the closing `</div>` of the main container, to improve internal linking and SEO.
3. **Verify the change**
   - Use `npm run check` to ensure there are no SvelteKit or TypeScript compilation errors.
4. **Update `docs/daily_health_report.md`**
   - Use a bash command to append the daily improvement report summarizing this SEO enhancement to `docs/daily_health_report.md`.
5. **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.**
   - Run the pre_commit_instructions tool and follow its steps.
6. **Submit changes**
   - Commit and push the changes.
