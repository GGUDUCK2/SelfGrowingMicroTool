<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Copy, Save, AlertTriangle, HelpCircle, Terminal } from 'lucide-svelte';

  export let dictionary: any;

  const dispatch = createEventDispatcher();

  let activeScenarioId: string | null = null;

  $: scenarios = dictionary.doctor.scenarios;

  $: activeScenario = activeScenarioId ? scenarios.find((s: any) => s.id === activeScenarioId) : null;

  function copy(command: string) {
      navigator.clipboard.writeText(command);
      dispatch('copy');
  }

  function save(command: string, details: string) {
      dispatch('save', { type: 'command', content: command, details: details });
  }
</script>

<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
    <!-- Selection Area -->
    <div class="lg:col-span-5 flex flex-col h-full space-y-4">
        <div class="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} class="text-orange-500" />
            <h2 class="text-lg font-bold text-slate-800 dark:text-white">{dictionary.doctor.whatHappened}</h2>
        </div>

        <div class="flex-1 overflow-y-auto pr-2 space-y-2">
            {#each scenarios as scenario (scenario.id)}
                <button
                    on:click={() => activeScenarioId = scenario.id}
                    class="w-full min-h-[44px] text-left p-3 rounded-lg border transition-all flex flex-col gap-1 {activeScenarioId === scenario.id ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-orange-300 dark:hover:border-slate-600'}"
                >
                    <span class="font-medium text-sm text-slate-900 dark:text-white transition-colors {activeScenarioId === scenario.id ? 'text-orange-700 dark:text-orange-300' : ''}">{scenario.title}</span>
                    <span class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{scenario.brief}</span>
                </button>
            {/each}
        </div>
    </div>

    <!-- Solution Area -->
    <div class="lg:col-span-7 flex flex-col h-full">
        {#if activeScenario}
            <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full">
                <div class="mb-6">
                    <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">{activeScenario.title}</h3>
                    <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{activeScenario.description}</p>
                </div>

                <div class="space-y-4 flex-1 overflow-y-auto pr-2">
                    {#each activeScenario.steps as step, index}
                        <div class="space-y-2">
                            <div class="flex gap-2 items-start">
                                <div class="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0 mt-0.5">{index + 1}</div>
                                <div class="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{step.explanation}</div>
                            </div>
                            {#if step.command}
                                <div class="bg-slate-900 rounded-xl p-4 shadow-inner flex items-center justify-between group ml-7">
                                    <div class="flex items-center gap-3 overflow-x-auto">
                                        <Terminal size={16} class="text-green-400 shrink-0" />
                                        <code class="font-mono text-sm text-green-400 whitespace-nowrap">$ {step.command}</code>
                                    </div>
                                    <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        <button
                                            on:click={() => copy(step.command)}
                                            class="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
                                            title="Copy Command"
                                            aria-label="Copy Command"
                                        >
                                            <Copy size={16} />
                                        </button>
                                        <button
                                            on:click={() => save(step.command, activeScenario.title)}
                                            class="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
                                            title="Save to History"
                                            aria-label="Save to History"
                                        >
                                            <Save size={16} />
                                        </button>
                                    </div>
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
        {:else}
            <div class="flex-1 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <HelpCircle size={48} class="mb-4 opacity-50" />
                <p class="text-sm">{dictionary.doctor.selectScenario}</p>
            </div>
        {/if}
    </div>
</div>
