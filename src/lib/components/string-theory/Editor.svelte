<script lang="ts">
  import { onMount } from 'svelte';
  import { TextAnalyzer } from '$lib/utils/string-theory/analyzer';
  import { TextTransformer } from '$lib/utils/string-theory/transformer';
  import { TextCleaner } from '$lib/utils/string-theory/cleaner';
  import type { TextStats } from '$lib/utils/string-theory/types';
  import { db } from '$lib/db/string-theory';
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';

  export let text = '';
  export let stats: TextStats;

  $: dict = getDictionary($page.params.lang || 'en').tools.stringTheory;

  // Auto-resize textarea
  let textarea: HTMLTextAreaElement;

  function resize() {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }

  // Reactive analysis
  $: {
    stats = TextAnalyzer.analyze(text);
    if (text) resize();
  }

  onMount(() => {
    resize();
  });

  function handleInput(e: Event) {
    text = (e.target as HTMLTextAreaElement).value;
    resize();
  }
</script>

<div class="relative group">
  <textarea
    bind:this={textarea}
    value={text}
    on:input={handleInput}
    class="w-full min-h-[300px] p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200 resize-none shadow-inner"
    placeholder={dict.input}
  ></textarea>

  <div class="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
    <button
      class="bg-white dark:bg-slate-800 text-slate-500 hover:text-indigo-600 p-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700"
      on:click={() => { navigator.clipboard.writeText(text); }}
      title="Copy"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    </button>
    <button
      class="bg-white dark:bg-slate-800 text-slate-500 hover:text-red-600 p-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700"
      on:click={() => { text = ''; resize(); }}
      title="Clear"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  </div>
</div>
