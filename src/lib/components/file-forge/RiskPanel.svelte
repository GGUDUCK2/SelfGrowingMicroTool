<script lang="ts">
  import { Shield, AlertTriangle, CheckCircle, Info } from 'lucide-svelte';
  import type { RiskAnalysis } from '$lib/utils/file-forge/risk';

  export let risk: RiskAnalysis;

  // Calculate safety score (inverse of risk)
  $: safetyScore = Math.max(0, 100 - risk.score);

  function getLevelColor(level: string) {
      switch(level) {
          case 'Safe': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
          case 'Low': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
          case 'Medium': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
          case 'High': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
          case 'Critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
          default: return 'text-slate-600 bg-slate-100';
      }
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl border-2 {getLevelColor(risk.level)} transition-colors duration-300">
    <div class="p-3 rounded-full bg-white/80 dark:bg-black/20 backdrop-blur-sm shrink-0 shadow-sm">
        {#if risk.level === 'Safe'}
            <CheckCircle size={32} />
        {:else if risk.level === 'Low'}
            <Shield size={32} />
        {:else if risk.level === 'Medium'}
            <Info size={32} />
        {:else}
            <AlertTriangle size={32} />
        {/if}
    </div>

    <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
            <h3 class="text-xl font-bold tracking-tight">Safety Score: {safetyScore}/100</h3>
            <span class="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/50 dark:bg-black/20">
                {risk.level}
            </span>
        </div>
        <p class="text-sm font-medium opacity-90">
            {#if risk.level === 'Safe'}
                No obvious anomalies detected.
            {:else if risk.level === 'Low'}
                File appears mostly safe with minor observations.
            {:else if risk.level === 'Medium'}
                Some suspicious characteristics detected. Exercise caution.
            {:else}
                High risk indicators found. Do not open unless trusted.
            {/if}
        </p>
    </div>

    <!-- Visual Gauge -->
    <div class="hidden sm:block w-24 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
        <div class="h-full transition-all duration-500 {risk.level === 'Safe' ? 'bg-emerald-500' : risk.level === 'Critical' ? 'bg-red-500' : 'bg-current'}" style="width: {safetyScore}%"></div>
    </div>
  </div>

  {#if risk.factors.length > 0}
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h4 class="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <AlertTriangle size={18} class="text-amber-500" />
              Risk Factors
          </h4>
          <ul class="space-y-3">
              {#each risk.factors as factor (factor)}
                  <li class="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 shadow-sm shadow-red-500/50"></span>
                      <span class="leading-relaxed">{factor}</span>
                  </li>
              {/each}
          </ul>
      </div>
  {/if}

  <p class="text-xs text-center text-slate-400 dark:text-slate-600 max-w-lg mx-auto">
      * Heuristic analysis only. A high score does not guarantee safety, and a low score does not guarantee malware. Always use an antivirus.
  </p>
</div>
