<script lang="ts">
  import type { GameConfig } from '$lib/utils/key-forge/types';
  import { createEventDispatcher } from 'svelte';

  export let config: GameConfig;
  export let dict: any;

  const dispatch = createEventDispatcher();

  function update(key: keyof GameConfig, value: any) {
      dispatch('change', { [key]: value });
  }
</script>

<div class="flex flex-wrap items-center gap-4 bg-slate-100 dark:bg-slate-800/50 p-2 rounded-xl text-sm mb-8 transition-colors w-full border border-slate-200 dark:border-slate-700">
    <!-- Mode -->
    <div class="flex bg-white dark:bg-slate-900 rounded-lg p-1 shadow-sm border border-slate-200 dark:border-slate-700">
        {#each ['time', 'words', 'quote', 'zen'] as mode}
            <button
                class="px-3 py-1.5 rounded-md transition-all font-medium capitalize"
                class:bg-indigo-600={config.mode === mode}
                class:text-white={config.mode === mode}
                class:text-slate-600={config.mode !== mode}
                class:dark:text-slate-400={config.mode !== mode}
                class:hover:bg-slate-100={config.mode !== mode}
                class:dark:hover:bg-slate-800={config.mode !== mode}
                on:click={() => update('mode', mode)}
            >
                {dict[mode] || mode}
            </button>
        {/each}
    </div>

    <!-- Duration / Count -->
    {#if config.mode === 'time'}
        <div class="flex bg-white dark:bg-slate-900 rounded-lg p-1 shadow-sm border border-slate-200 dark:border-slate-700">
            {#each [15, 30, 60, 120] as d}
                <button
                    class="px-3 py-1.5 rounded-md transition-all font-medium"
                    class:bg-indigo-600={config.duration === d}
                    class:text-white={config.duration === d}
                    class:text-slate-600={config.duration !== d}
                    class:dark:text-slate-400={config.duration !== d}
                    class:hover:bg-slate-100={config.duration !== d}
                    class:dark:hover:bg-slate-800={config.duration !== d}
                    on:click={() => update('duration', d)}
                >
                    {d}s
                </button>
            {/each}
        </div>
    {:else if config.mode === 'words'}
        <div class="flex bg-white dark:bg-slate-900 rounded-lg p-1 shadow-sm border border-slate-200 dark:border-slate-700">
            {#each [10, 25, 50, 100] as c}
                <button
                    class="px-3 py-1.5 rounded-md transition-all font-medium"
                    class:bg-indigo-600={config.wordCount === c}
                    class:text-white={config.wordCount === c}
                    class:text-slate-600={config.wordCount !== c}
                    class:dark:text-slate-400={config.wordCount !== c}
                    class:hover:bg-slate-100={config.wordCount !== c}
                    class:dark:hover:bg-slate-800={config.wordCount !== c}
                    on:click={() => update('wordCount', c)}
                >
                    {c}
                </button>
            {/each}
        </div>
    {/if}

    <!-- Language -->
    <div class="flex bg-white dark:bg-slate-900 rounded-lg p-1 shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto max-w-[200px] md:max-w-none no-scrollbar">
        {#each ['english', 'javascript', 'python', 'rust', 'go', 'html', 'css'] as l}
             <button
                class="px-3 py-1.5 rounded-md transition-all font-medium capitalize whitespace-nowrap"
                class:bg-indigo-600={config.language === l}
                class:text-white={config.language === l}
                class:text-slate-600={config.language !== l}
                class:dark:text-slate-400={config.language !== l}
                class:hover:bg-slate-100={config.language !== l}
                class:dark:hover:bg-slate-800={config.language !== l}
                on:click={() => update('language', l)}
            >
                {l === 'javascript' ? 'JS' : l}
            </button>
        {/each}
    </div>

    <!-- Sound -->
    <div class="flex bg-white dark:bg-slate-900 rounded-lg p-1 shadow-sm border border-slate-200 dark:border-slate-700 ml-auto">
        {#each ['mute', 'mechanical', 'typewriter', 'laptop'] as s}
             <button
                class="px-3 py-1.5 rounded-md transition-all font-medium capitalize flex items-center gap-1"
                class:bg-indigo-600={config.sound === s}
                class:text-white={config.sound === s}
                class:text-slate-600={config.sound !== s}
                class:dark:text-slate-400={config.sound !== s}
                class:hover:bg-slate-100={config.sound !== s}
                class:dark:hover:bg-slate-800={config.sound !== s}
                on:click={() => update('sound', s)}
                title={dict.sounds[s]}
            >
                {#if s === 'mute'}
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                {:else}
                    {s === 'mechanical' ? 'Mech' : s}
                {/if}
            </button>
        {/each}
    </div>
</div>
