<script lang="ts">
  import { onMount } from 'svelte';
  import { initMermaid, renderDiagram } from '$lib/utils/diagram-forge/renderer';
  import { Loader2, AlertCircle } from '@lucide/svelte';

  export let code: string;
  export let theme: string = 'default';

  let svgContent: string = '';
  let error: string = '';
  let loading: boolean = false;

  let timer: ReturnType<typeof setTimeout>;

  $: if ((code || theme) && typeof window !== 'undefined') {
      requestUpdate();
  }

  function requestUpdate() {
      clearTimeout(timer);
      timer = setTimeout(async () => {
          loading = true;
          await updateDiagram();
          loading = false;
      }, 800); // 800ms debounce
  }

  async function updateDiagram() {
      // Re-init config for theme
      await initMermaid(theme);

      if (!code.trim()) {
          svgContent = '';
          error = '';
          return;
      }

      // Unique ID to prevent DOM conflicts
      const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);

      const result = await renderDiagram(id, code);
      if (result.error) {
          error = result.error;
      } else {
          error = '';
          svgContent = result.svg;
      }
  }

  onMount(async () => {
      await initMermaid(theme);
      if (code) requestUpdate();
  });
</script>

<div class="w-full h-full overflow-auto flex flex-col items-center justify-center bg-white dark:bg-slate-800 relative p-4 transition-colors duration-300">
    {#if loading}
        <div class="absolute top-4 right-4 text-indigo-500 animate-spin z-10">
            <Loader2 size={24} />
        </div>
    {/if}

    {#if svgContent && !error}
        <div class="w-full h-full flex items-center justify-center overflow-auto mermaid-container">
            {@html svgContent}
        </div>
    {:else if !code.trim()}
        <div class="text-slate-400 text-sm">
            Start typing to create a diagram...
        </div>
    {/if}

    {#if error}
        <div class="absolute bottom-0 left-0 right-0 bg-red-50/95 dark:bg-red-900/90 text-red-600 dark:text-red-200 p-4 border-t border-red-100 dark:border-red-800 flex gap-3 items-start backdrop-blur-sm transition-all">
            <AlertCircle size={20} class="shrink-0 mt-0.5" />
            <div class="flex-1 min-w-0">
                <p class="font-bold text-xs uppercase mb-1">Syntax Error</p>
                <pre class="whitespace-pre-wrap font-mono text-xs overflow-x-auto max-h-32">{error}</pre>
            </div>
        </div>
    {/if}
</div>

<style>
    /* Ensure SVG scales nicely */
    :global(.mermaid-container svg) {
        max-width: 100% !important;
        height: auto !important;
        max-height: 100%;
    }
</style>
