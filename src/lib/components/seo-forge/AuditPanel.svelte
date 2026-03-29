<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { validateMetaTags, extractKeywords, type MetaTags, type AuditIssue } from '$lib/utils/seo';

  export let tags: MetaTags;
  const dispatch = createEventDispatcher();

  $: issues = validateMetaTags(tags);
  $: criticalCount = issues.filter(i => i.severity === 'critical').length;
  $: warningCount = issues.filter(i => i.severity === 'warning').length;
  $: successCount = issues.filter(i => i.severity === 'success').length;
  $: score = Math.max(0, 100 - (criticalCount * 25) - (warningCount * 10));

  // Keyword Analysis
  $: titleKeywords = extractKeywords(tags.title);
  $: descKeywords = extractKeywords(tags.description);
  $: missingKeywords = titleKeywords.filter(k => !tags.description.toLowerCase().includes(k.toLowerCase()));

  function fixIssue(issue: AuditIssue) {
      if (issue.id === 'title-long') {
          dispatch('fix', { field: 'title', value: tags.title.slice(0, 60) });
      } else if (issue.id === 'desc-long') {
          dispatch('fix', { field: 'description', value: tags.description.slice(0, 160) });
      }
  }

  function getIcon(severity: string) {
      switch(severity) {
          case 'critical': return '🔴';
          case 'warning': return '🟠';
          case 'info': return '🔵';
          case 'success': return '🟢';
          default: return '⚪';
      }
  }
</script>

<div class="space-y-6">
    <!-- Score Header -->
    <div class="flex items-center justify-between">
        <h3 class="font-bold text-lg dark:text-white">SEO Audit</h3>
        <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Score</span>
            <div class="px-3 py-1 rounded-full font-bold text-sm {score >= 90 ? 'bg-green-100 text-green-700' : score >= 70 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}">
                {score} / 100
            </div>
        </div>
    </div>

    <!-- Keyword Analysis -->
    {#if titleKeywords.length > 0}
        <div class="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800">
            <h4 class="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-key"><path d="m21 2-2 2m-7.6 7.6a6.5 6.5 0 1 1-5.3-5.3"/><circle cx="8" cy="8" r="3"/><path d="M7 17v5"/><path d="M12 17h5"/></svg>
                Keyword Consistency
            </h4>
            <div class="flex flex-wrap gap-1.5">
                 {#each titleKeywords as kw}
                     <span class="px-2 py-0.5 rounded text-xs font-medium border {tags.description.toLowerCase().includes(kw) ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}" title={tags.description.toLowerCase().includes(kw) ? 'Found in description' : 'Missing from description'}>
                         {kw}
                     </span>
                 {/each}
            </div>
            {#if missingKeywords.length > 0}
                <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Consider adding <strong>{missingKeywords.slice(0, 3).join(', ')}</strong> to your description for better relevance.
                </p>
            {/if}
        </div>
    {/if}

    <!-- Issues List -->
    <div class="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {#each issues as issue (issue.id)}
            <div class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-sm border-l-4 {issue.severity === 'critical' ? 'border-red-500' : issue.severity === 'warning' ? 'border-orange-500' : issue.severity === 'success' ? 'border-green-500' : 'border-blue-500'}">
                <div class="flex gap-2">
                    <span class="flex-shrink-0 mt-0.5">{getIcon(issue.severity)}</span>
                    <div class="flex-1">
                        <p class="text-slate-700 dark:text-slate-300">{issue.message}</p>
                        {#if issue.fixAvailable}
                            <button
                                on:click={() => fixIssue(issue)}
                                class="min-h-[44px] min-w-[44px] mt-2 text-xs bg-white dark:bg-slate-600 px-2 py-1 rounded border border-slate-200 dark:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 transition-colors"
                            >
                                Auto Fix
                            </button>
                        {/if}
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>
