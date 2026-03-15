<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { COMMANDS, generateCommand } from '$lib/utils/git-forge/commands';
  import type { CommandDefinition } from '$lib/utils/git-forge/types';
  import type { GitForgeDictionary } from './types';
  import { Copy, Terminal, Save, HelpCircle, Zap } from 'lucide-svelte';

  export let dictionary: GitForgeDictionary;

  const dispatch = createEventDispatcher();

  let activeCategory: string = 'basic';
  let activeCommandId: string = 'init';
  let formValues: Record<string, any> = {};

  // Group commands by category
  $: categories = ['basic', 'branching', 'remote', 'history', 'advanced'];
  $: commandsByCategory = categories.reduce((acc, cat) => {
      acc[cat] = COMMANDS.filter(c => c.category === cat);
      return acc;
  }, {} as Record<string, CommandDefinition[]>);

  $: activeCommand = COMMANDS.find(c => c.id === activeCommandId) as CommandDefinition;
  $: generated = activeCommand ? generateCommand(activeCommand, formValues) : '';

  onMount(() => {
      resetForm(activeCommandId);
  });

  function handleCategoryChange(cat: string) {
      activeCategory = cat;
      const firstInCat = commandsByCategory[cat][0];
      if (firstInCat) {
          handleCommandChange(firstInCat.id);
      }
  }

  function handleCommandChange(id: string) {
      activeCommandId = id;
      resetForm(id);
  }

  function resetForm(id: string) {
      formValues = {};
      const cmd = COMMANDS.find(c => c.id === id);
      if (cmd) {
          cmd.options.forEach(opt => {
              if (opt.defaultValue !== undefined) {
                  formValues[opt.id] = opt.defaultValue;
              }
          });
      }
  }

  function copy() {
      navigator.clipboard.writeText(generated);
      dispatch('copy');
  }

  function save() {
      dispatch('save', { type: 'command', content: generated, details: activeCommand.command });
  }

  function handleKeydown(e: KeyboardEvent) {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          save();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          copy();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          resetForm(activeCommandId);
      }
  }

  // Pre-configured workflow states
  function loadPreset(presetId: string) {
      if (presetId === 'new-feature') {
          activeCategory = 'branching';
          handleCommandChange('checkout');
          formValues = { branch: 'feature/new-feature', newBranch: true };
      } else if (presetId === 'hotfix') {
          activeCategory = 'branching';
          handleCommandChange('checkout');
          formValues = { branch: 'hotfix/bug-fix', newBranch: true };
      } else if (presetId === 'sync') {
          activeCategory = 'remote';
          handleCommandChange('pull');
          formValues = { rebase: true };
      }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
    <!-- Sidebar: Categories & Commands -->
    <div class="md:col-span-4 lg:col-span-3 space-y-6 border-r border-slate-200 dark:border-slate-700 pr-4">
        <div>
            <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{dictionary.command.category}</h3>
            <div class="flex flex-wrap gap-2">
                {#each categories as cat}
                    <button
                        class="min-h-[44px] min-w-[44px] px-3 py-1.5 text-xs font-medium rounded-full transition-colors {activeCategory === cat ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}"
                        on:click={() => handleCategoryChange(cat)}
                        aria-label={`Select category ${dictionary.command.categories[cat] || cat}`}
                    >
                        {dictionary.command.categories[cat] || cat}
                    </button>
                {/each}
            </div>
        </div>

        <div>
            <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{dictionary.command.operation}</h3>
            <div class="space-y-1">
                {#each commandsByCategory[activeCategory] || [] as cmd}
                    <button
                        class="min-h-[44px] w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between {activeCommandId === cmd.id ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}"
                        on:click={() => handleCommandChange(cmd.id)}
                    >
                        <span>{dictionary.command.operations[cmd.id] || cmd.id}</span>
                        {#if activeCommandId === cmd.id}
                            <div class="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                        {/if}
                    </button>
                {/each}
            </div>
        </div>
    </div>

    <!-- Main Area: Options & Preview -->
    <div class="md:col-span-8 lg:col-span-9 flex flex-col h-full">
        <!-- Configuration -->
        <div class="flex-1 overflow-y-auto mb-6">
            <!-- Presets -->
            <div class="flex flex-wrap gap-2 mb-4">
                <button on:click={() => loadPreset('new-feature')} class="min-h-[44px] flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors">
                    <Zap size={14} /> Feature Branch
                </button>
                <button on:click={() => loadPreset('hotfix')} class="min-h-[44px] flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors">
                    <Zap size={14} /> Hotfix
                </button>
                <button on:click={() => loadPreset('sync')} class="min-h-[44px] flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors">
                    <Zap size={14} /> Sync (Pull Rebase)
                </button>
            </div>

            <div class="flex items-center gap-2 mb-4">
                <h2 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    {dictionary.command.operations[activeCommand.id] || activeCommand.command}
                </h2>
                <div class="group relative">
                    <HelpCircle size={16} class="text-slate-400 cursor-help" />
                    <div class="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-64 p-2 bg-slate-800 text-white text-xs rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                        {activeCommand.description}
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {#each activeCommand.options as opt (opt.id)}
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        {#if opt.type === 'boolean'}
                            <label class="flex min-h-[44px] items-center justify-between cursor-pointer group">
                                <span class="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">{opt.label}</span>
                                <input type="checkbox" bind:checked={formValues[opt.id]} class="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600" />
                            </label>
                            {#if opt.flag}
                                <div class="text-[10px] font-mono text-slate-400 mt-1">{opt.flag}</div>
                            {/if}
                        {:else if opt.type === 'string'}
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{opt.label}</label>
                            <input
                                type="text"
                                bind:value={formValues[opt.id]}
                                placeholder={opt.placeholder}
                                class="min-h-[44px] w-full text-sm rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                            />
                            {#if opt.flag}
                                <div class="text-[10px] font-mono text-slate-400 mt-1">{opt.flag || 'Positional'}</div>
                            {/if}
                        {:else if opt.type === 'select'}
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{opt.label}</label>
                            <select
                                bind:value={formValues[opt.id]}
                                class="min-h-[44px] w-full text-sm rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                {#each opt.options || [] as val}
                                    <option value={val}>{val}</option>
                                {/each}
                            </select>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>

        <!-- Terminal Output -->
        <div class="mt-auto">
            <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{dictionary.command.preview}</h3>
            <div class="bg-slate-900 rounded-xl p-4 shadow-xl flex items-center justify-between group">
                <div class="flex items-center gap-3 overflow-x-auto">
                    <Terminal size={18} class="text-green-400 shrink-0" />
                    <code class="font-mono text-sm text-green-400 whitespace-nowrap">$ {generated}</code>
                </div>
                <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        on:click={copy}
                        class="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
                        title={dictionary.command.copy}
                        aria-label={dictionary.command.copy}
                    >
                        <Copy size={16} />
                    </button>
                    <button
                        on:click={save}
                        class="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
                        title="Save to History"
                        aria-label="Save to History"
                    >
                        <Save size={16} />
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
