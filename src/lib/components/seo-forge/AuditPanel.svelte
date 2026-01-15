<script lang="ts">
  import type { MetaTags, AuditIssue } from '$lib/utils/seo';
  import { validateMetaTags } from '$lib/utils/seo';
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';

  export let tags: MetaTags;

  const dispatch = createEventDispatcher();

  $: issues = validateMetaTags(tags);
  $: criticalCount = issues.filter(i => i.severity === 'critical').length;
  $: warningCount = issues.filter(i => i.severity === 'warning').length;
  $: score = Math.max(0, 100 - (criticalCount * 20) - (warningCount * 10));

  function fixIssue(issue: AuditIssue) {
    if (issue.id === 'title-long') {
      dispatch('fix', { field: 'title', value: tags.title.substring(0, 57) + '...' });
    } else if (issue.id === 'desc-long') {
      dispatch('fix', { field: 'description', value: tags.description.substring(0, 157) + '...' });
    } else if (issue.id === 'title-short') {
        // Example fix: append brand
        dispatch('fix', { field: 'title', value: tags.title + ' | My Brand' });
    }
  }

  function getIcon(severity: string) {
      switch (severity) {
          case 'critical': return '❌';
          case 'warning': return '⚠️';
          case 'info': return 'ℹ️';
          case 'success': return '✅';
          default: return '•';
      }
  }

  function getColor(severity: string) {
      switch (severity) {
          case 'critical': return 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
          case 'warning': return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
          case 'info': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
          case 'success': return 'text-green-500 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
          default: return 'text-slate-500';
      }
  }
</script>

<div class="space-y-4">
    <div class="flex items-center justify-between">
        <h3 class="font-semibold text-slate-800 dark:text-white">Audit Score</h3>
        <div class="flex items-center gap-2">
             <span class="text-2xl font-bold {score >= 90 ? 'text-green-500' : score >= 70 ? 'text-amber-500' : 'text-red-500'}">
                 {score}
             </span>
             <span class="text-xs text-slate-500">/ 100</span>
        </div>
    </div>

    <!-- Progress Bar -->
    <div class="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
            class="h-full transition-all duration-500 {score >= 90 ? 'bg-green-500' : score >= 70 ? 'bg-amber-500' : 'bg-red-500'}"
            style="width: {score}%"
        ></div>
    </div>

    <div class="space-y-2 mt-4">
        {#each issues as issue (issue.id)}
            <div class="flex items-start gap-3 p-3 rounded-lg border {getColor(issue.severity)} transition-all" transition:slide|local>
                <div class="flex-shrink-0 mt-0.5">{getIcon(issue.severity)}</div>
                <div class="flex-grow">
                    <p class="text-sm font-medium text-slate-800 dark:text-slate-200">{issue.message}</p>
                    {#if issue.fixAvailable}
                        <button
                            on:click={() => fixIssue(issue)}
                            class="text-xs font-semibold underline mt-1 opacity-80 hover:opacity-100"
                        >
                            Auto Fix
                        </button>
                    {/if}
                </div>
            </div>
        {/each}
    </div>
</div>
