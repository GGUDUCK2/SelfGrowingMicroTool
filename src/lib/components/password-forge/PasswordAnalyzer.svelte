<script lang="ts">
  import { analyzePassword, type PasswordAnalysis } from '$lib/utils/password-forge/generator';
  import { Shield, AlertTriangle, Info, CheckCircle2 } from 'lucide-svelte';

  export let dictionary: any;
  export let onUseGenerated: (pwd: string) => void;

  let passwordInput = '';
  $: analysis = analyzePassword(passwordInput);

  function getScoreColor(score: number) {
    if (score <= 2) return 'text-red-500 bg-red-50 dark:bg-red-900/30';
    if (score === 3) return 'text-amber-500 bg-amber-50 dark:bg-amber-900/30';
    if (score === 4) return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30';
    return 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30';
  }
</script>

<div class="space-y-6">
  <div class="relative">
    <label for="password-input" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{dictionary.analyzer.inputLabel || 'Password to analyze'}</label>
    <input
      id="password-input"
      type="text"
      bind:value={passwordInput}
      placeholder={dictionary.analyzer.placeholder || 'Type or paste a password...'}
      class="w-full min-h-[44px] bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
    />
  </div>

  {#if passwordInput}
    <div class="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Shield size={20} class="text-indigo-500" />
            {dictionary.analyzer.score || 'Security Score'}
          </h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {dictionary.entropy}: {Math.round(analysis.entropy)} bits
          </p>
        </div>
        <div class="text-3xl font-bold px-4 py-2 rounded-xl {getScoreColor(analysis.score)}">
          {analysis.score}/5
        </div>
      </div>

      <div class="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
        {#if analysis.feedback.length > 0}
          <h4 class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{dictionary.analyzer.feedback || 'Actionable Feedback'}:</h4>
          <ul class="space-y-2">
            {#each analysis.feedback as fb}
              <li class="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                {#if fb.includes('too short') || fb.includes('consecutive') || fb.includes('repeated')}
                  <AlertTriangle size={16} class="text-red-500 mt-0.5 shrink-0" />
                {:else}
                  <Info size={16} class="text-indigo-500 mt-0.5 shrink-0" />
                {/if}
                <span>{fb}</span>
              </li>
            {/each}
          </ul>
        {:else}
          <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-xl">
             <CheckCircle2 size={20} />
             <span class="font-medium">{dictionary.analyzer.perfect || 'Looks great! No obvious vulnerabilities detected.'}</span>
          </div>
        {/if}
      </div>

      {#if analysis.isVulnerable}
        <div class="pt-4">
           <button
             on:click={() => onUseGenerated(passwordInput)}
             class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors min-h-[44px]"
           >
             {dictionary.analyzer.generateAlternative || 'Generate a Better Alternative'}
           </button>
        </div>
      {/if}
    </div>
  {:else}
    <div class="p-8 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/30">
      <Shield size={32} class="mx-auto mb-3 opacity-50 text-indigo-500" />
      <p>{dictionary.analyzer.emptyState || 'Enter a password above to analyze its strength and vulnerabilities.'}</p>
    </div>
  {/if}
</div>
