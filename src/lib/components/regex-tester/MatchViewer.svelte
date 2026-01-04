<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let testString = '';
  export let matches: { index: number; content: string; groups?: string[] }[] = [];
  export let error = '';
  export let dictionary: any;

  const dispatch = createEventDispatcher();

  function handleInput(e: Event) {
    testString = (e.target as HTMLTextAreaElement).value;
    dispatch('change', { testString });
  }

  // Generate the highlighted HTML content
  function getHighlightedHtml(text: string, matches: any[]) {
    if (!matches || matches.length === 0) return text;

    let lastIndex = 0;
    let html = '';

    // Matches are sorted by index
    for (const match of matches) {
      if (match.index < lastIndex) continue; // Skip overlapping matches for visualization sanity

      // Text before match
      html += escapeHtml(text.slice(lastIndex, match.index));

      // Match itself
      const matchText = text.slice(match.index, match.index + match.content.length);
      html += `<mark class="bg-indigo-200 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-100 rounded px-0.5 border-b-2 border-indigo-500 cursor-help group relative">${escapeHtml(matchText)}
        <span class="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-slate-800 rounded shadow-lg whitespace-nowrap z-10">
          Match #${matches.indexOf(match) + 1}
        </span>
      </mark>`;

      lastIndex = match.index + match.content.length;
    }

    // Remaining text
    html += escapeHtml(text.slice(lastIndex));
    return html;
  }

  function escapeHtml(text: string) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px]">
  <!-- Input Area -->
  <div class="flex flex-col h-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl border border-indigo-100 dark:border-indigo-900 shadow-sm overflow-hidden">
    <div class="px-4 py-3 border-b border-indigo-50 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/20">
      <label for="test-string" class="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
        {dictionary.testString}
      </label>
    </div>
    <div class="relative flex-grow">
      <!-- Backdrop for highlights (same styling as textarea) -->
      <div
        class="absolute inset-0 p-4 font-mono text-sm whitespace-pre-wrap break-all pointer-events-none text-transparent overflow-auto"
        aria-hidden="true"
      >
        {@html getHighlightedHtml(testString, matches)}
      </div>

      <!-- Textarea -->
      <textarea
        id="test-string"
        class="w-full h-full p-4 font-mono text-sm bg-transparent border-none resize-none focus:ring-0 whitespace-pre-wrap break-all text-slate-700 dark:text-slate-300 z-10 relative leading-relaxed"
        value={testString}
        on:input={handleInput}
        spellcheck="false"
      ></textarea>
    </div>
  </div>

  <!-- Results Area -->
  <div class="flex flex-col h-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl border border-indigo-100 dark:border-indigo-900 shadow-sm overflow-hidden">
    <div class="px-4 py-3 border-b border-indigo-50 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/20 flex justify-between items-center">
      <span class="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
        {dictionary.matches}
        {#if matches.length > 0}
          <span class="ml-2 px-2 py-0.5 text-xs bg-indigo-200 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-100 rounded-full">
            {matches.length}
          </span>
        {/if}
      </span>
    </div>

    <div class="flex-grow overflow-y-auto p-4 custom-scrollbar">
      {#if error}
        <div class="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/50 flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span class="text-sm">{error}</span>
        </div>
      {:else if matches.length === 0}
        <div class="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span class="text-sm">{dictionary.noMatches}</span>
        </div>
      {:else}
        <div class="space-y-3">
          {#each matches as match, i}
            <div class="bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700 overflow-hidden transition-all hover:shadow-md">
              <div class="px-3 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <span class="text-xs font-mono text-slate-500">Match #{i + 1}</span>
                <span class="text-xs font-mono text-slate-400">Index: {match.index}</span>
              </div>
              <div class="p-3 font-mono text-sm text-slate-700 dark:text-slate-300 break-all bg-white dark:bg-slate-900">
                {match.content}
              </div>
              {#if match.groups && match.groups.length > 0}
                <div class="px-3 py-2 bg-indigo-50/30 dark:bg-indigo-900/10 border-t border-slate-100 dark:border-slate-700">
                  <div class="text-xs font-semibold text-indigo-800 dark:text-indigo-300 mb-2">{dictionary.groups}</div>
                  <div class="grid gap-2">
                    {#each match.groups as group, j}
                      <div class="flex gap-2 text-xs">
                        <span class="font-mono text-slate-400 w-6 text-right">${j + 1}</span>
                        <span class="font-mono text-slate-700 dark:text-slate-300 break-all">{group}</span>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  /* Custom Scrollbar for results */
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 20px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.8);
  }
</style>
