1. **Create `PomodoroTimer.svelte`**:
   - Move the existing timer logic from `src/routes/[lang]/tools/pomodoro-timer/+page.svelte` to a new core component `src/lib/components/pomodoro-timer/PomodoroTimer.svelte`.
   - Add IndexedDB (Dexie.js) integration for saving and loading history of pomodoro sessions in `src/lib/db.ts` (e.g., `pomodoroHistory`).
   - Enhance the UI in `PomodoroTimer.svelte` to include a local workspace showing the history of completed pomodoros, similar to other tools.
   - Refactor `src/routes/[lang]/tools/pomodoro-timer/+page.svelte` to use the new `PomodoroTimer` component and ensure layout constraints (e.g., `AdPlaceholder`, `GuideSection`, `FAQSection`, `RelatedTools` outside the core component).

2. **Database Integration (`src/lib/db.ts`)**:
   - Add `PomodoroHistory` interface.
   - Add `pomodoroHistory!: DexieTable<PomodoroHistory>;` to `MySubClassedDexie`.
   - Bump version from 56 to 57 and add `pomodoroHistory: '++id, mode, duration, completedAt, starred'` to version 57 in `src/lib/db.ts`.

3. **Routing Integrity**:
   - Verify that all navigation works flawlessly, no 404s, back/forward works, parameters handle well.

4. **Verify Frontend**:
   - Write a small playwright test script if necessary, or manually verify using playwright screenshots/videos.
   - Run tests/linters `npm run check && npm run build`.

5. **Pre-commit and Submit**:
   - Follow `pre_commit_instructions`.
   - Commit directly to main branch and submit.
