<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import Button from '$lib/components/Button.svelte';

  export let rawSvg: string = '';
  export let t: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  let textareaRef: HTMLTextAreaElement;

  function handleInput(event: Event) {
    rawSvg = (event.target as HTMLTextAreaElement).value;
  }

  function handleFileUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      rawSvg = e.target?.result as string;
    };
    reader.readAsText(file);
  }

  function clearSvg() {
    rawSvg = '';
  }

  // Example default SVG
  const exampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <!-- This is a comment that can be removed -->
  <g id="layer1" enable-background="new 0 0 100 100">
    <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
  </g>
</svg>`;

  function loadExample() {
    rawSvg = exampleSvg;
  }

</script>

<div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full min-h-[400px]">
  <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
    <h2 class="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>
      {t.editor.title}
    </h2>
    <div class="flex gap-2">
      <Button variant="secondary" size="sm" onclick={loadExample} class="min-w-[44px] min-h-[44px]">
        {t.editor.loadExample}
      </Button>
      <label class="cursor-pointer min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
        <input type="file" accept=".svg" class="hidden" onchange={handleFileUpload} />
        {t.editor.upload}
      </label>
      <Button variant="danger" size="sm" onclick={clearSvg} class="min-w-[44px] min-h-[44px]" disabled={!rawSvg}>
        {t.editor.clear}
      </Button>
    </div>
  </div>

  <div class="flex-grow p-0 relative">
    <textarea
      bind:this={textareaRef}
      value={rawSvg}
      oninput={handleInput}
      class="w-full h-full min-h-[300px] p-4 font-mono text-sm bg-transparent text-slate-800 dark:text-slate-200 resize-none focus:outline-none focus:ring-0"
      placeholder={t.editor.placeholder}
      spellcheck="false"
    ></textarea>
  </div>
</div>