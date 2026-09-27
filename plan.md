1. **Initialize UUID Forge Core Engine:**
   - Execute a shell command using `cat << 'EOF' > src/routes/[lang]/tools/uuid-forge/+page.svelte` to scaffold the component file.
   - Within this file, implement the UUID generation logic using `import { v1, v4, v7 } from 'uuid';`. Include state variables for version (v1, v4, v7), quantity (up to 1000), output format (uppercase, lowercase, braces, no hyphens).
   - Use `list_files` and `read_file` to verify the code was written correctly.
2. **Develop the UI and Workspace Integration:**
   - Update `+page.svelte` (via `cat << 'EOF' > ...` or `replace_with_git_merge_diff`) to include a fully designed Tailwind CSS UI.
   - Add generator configuration controls and a display area for generated UUIDs.
   - Implement action buttons for copy, download, and clear.
   - Integrate Dexie.js for history by adding `import { db } from '$lib/db';` and writing functions to save generated batches.
   - Verify changes by reading the file.
3. **Implement i18n, SEO, and Routing Files:**
   - Create `src/routes/[lang]/tools/uuid-forge/+page.server.ts` with basic load function routing logic using `cat << 'EOF' > ...`.
   - Update `+page.svelte` to include an inline translation object (`dict`) for 'en' and 'ko'.
   - Add `<svelte:head>` for dynamic SEO metadata and JSON-LD schema (`SoftwareApplication`).
   - Add a comprehensive FAQ section below the tool.
   - Verify by reading the created files.
4. **Testing and Routing Integrity Audit:**
   - Run `npm run check` to verify types.
   - Run `npm run build && npm run preview` to perform a mandatory routing integrity check and ensure no navigation errors exist.
5. **Pre-commit Steps:**
   - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.
6. **Submission:**
   - Run the submit tool using branch `main`, commit message `feat: UUID Forge - The Definitive Edition with Pro-grade Details (YYYY-MM-DD)`, and a description.
