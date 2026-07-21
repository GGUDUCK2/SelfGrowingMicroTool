<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  export let t: any;
  export let cssGradient: string;

  let copied = false;
  let exportType: 'css' | 'tailwind' = 'css';

  $: tailwindClass = `bg-[${cssGradient.replace(/ /g, '_')}]`;
  $: exportCode = exportType === 'css' ? `background: ${cssGradient};` : tailwindClass;

  function handleCopy() {
    navigator.clipboard.writeText(exportCode);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between mb-2">
    <h3 class="text-sm font-semibold text-slate-900 dark:text-white">{t.export}</h3>
    <div class="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg">
      <button
        class="px-3 py-1 text-xs font-medium rounded-md transition-all {exportType === 'css' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}"
        on:click={() => exportType = 'css'}
      >
        CSS
      </button>
      <button
        class="px-3 py-1 text-xs font-medium rounded-md transition-all {exportType === 'tailwind' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}"
        on:click={() => exportType = 'tailwind'}
      >
        Tailwind
      </button>
    </div>
  </div>

  <div class="relative group">
    <pre class="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto text-sm font-mono text-slate-800 dark:text-slate-300">{exportCode}</pre>
    <Button
      class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity !px-3 !py-1 min-h-[32px] min-w-[44px]"
      variant="secondary"
      on:click={handleCopy}
    >
      {copied ? t.copied : t.copy}
    </Button>
  </div>

  <Button
    class="w-full justify-center min-h-[44px]"
    variant={copied ? 'secondary' : 'primary'}
    on:click={handleCopy}
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
    {copied ? t.copied : t.copy}
  </Button>
</div>
