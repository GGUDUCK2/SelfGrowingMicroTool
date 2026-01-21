<script lang="ts">
  import { X, Keyboard } from 'lucide-svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';

  export let isOpen = false;

  const dispatch = createEventDispatcher<{ close: void }>();

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang);
  $: t = dict.tools.timeForge.shortcuts;

  function close() {
      dispatch('close');
  }

  function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
  }

  $: shortcuts = [
      { key: ['Ctrl', 'M'], desc: t.meetingMode },
      { key: ['Right Arrow'], desc: t.nextSlot },
      { key: ['Left Arrow'], desc: t.prevDay },
      { key: ['R'], desc: t.reset },
  ];
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <button
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 w-full h-full border-0 cursor-default"
      on:click={close}
      on:keydown={(e) => e.key === 'Escape' && close()}
      aria-label="Close modal"
  >
      <div
          class="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl max-w-sm w-full relative cursor-auto text-left"
          role="document"
          on:click|stopPropagation
          on:keydown|stopPropagation
      >
          <button class="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors" on:click={close}>
              <X class="w-5 h-5" />
          </button>

          <div class="flex items-center space-x-3 mb-6">
              <div class="p-2 bg-indigo-500/10 rounded-lg">
                  <Keyboard class="w-6 h-6 text-indigo-400" />
              </div>
              <h3 class="text-xl font-bold text-white">{t.title}</h3>
          </div>

          <div class="space-y-3">
              {#each shortcuts as shortcut}
                  <div class="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <span class="text-slate-300 text-sm font-medium">{shortcut.desc}</span>
                      <div class="flex space-x-1">
                          {#each shortcut.key as k}
                              <kbd class="px-2 py-1 bg-slate-700 text-slate-200 rounded text-xs font-mono border-b-2 border-slate-600">{k}</kbd>
                          {/each}
                      </div>
                  </div>
              {/each}
          </div>

          <div class="mt-6 text-center text-xs text-slate-500">
              {t.press} <kbd class="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-400">{t.esc}</kbd> {t.toClose}
          </div>
      </div>
  </div>
{/if}
