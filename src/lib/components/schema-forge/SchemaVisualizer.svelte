<script lang="ts">
  import { onMount } from 'svelte';
  import mermaid from 'mermaid';
  import { generateCode } from '$lib/utils/schema-forge/generators';
  import type { SchemaProject } from '$lib/types/schema-forge';
  import { browser } from '$app/environment';

  export let schema: SchemaProject;

  let container: HTMLDivElement;
  let svgContent = '';
  let error = '';
  let isRendering = false;

  $: mermaidCode = generateCode(schema, 'mermaid');

  async function render() {
      if (!browser || !container || !mermaidCode) return;

      // Prevent rapid re-renders
      if (isRendering) return;
      isRendering = true;

      try {
          // Initialize with current theme preference
          const isDark = document.documentElement.classList.contains('dark');
          mermaid.initialize({
              startOnLoad: false,
              theme: isDark ? 'dark' : 'default',
              securityLevel: 'loose',
              fontFamily: 'inherit'
          });

          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, mermaidCode);
          svgContent = svg;
          error = '';
      } catch (e) {
          console.error('Mermaid render error:', e);
          // Don't show error immediately to user as it might be transient during typing
          // error = 'Failed to render diagram';
      } finally {
          isRendering = false;
      }
  }

  // Debounce render
  let timer: ReturnType<typeof setTimeout>;

  $: if (mermaidCode) {
      if (browser) {
        clearTimeout(timer);
        timer = setTimeout(render, 500);
      }
  }

  onMount(() => {
      render();
  });
</script>

<div class="w-full h-full overflow-auto bg-slate-50 dark:bg-slate-900 flex justify-center items-start relative" bind:this={container}>
    {#if svgContent}
        <div class="p-8 min-w-full min-h-full flex justify-center items-center">
            {@html svgContent}
        </div>
    {:else if !schema.tables.length}
        <div class="absolute inset-0 flex items-center justify-center text-slate-400">
            <p>Add tables to visualize schema</p>
        </div>
    {:else}
         <div class="absolute inset-0 flex items-center justify-center text-slate-400">
            <div class="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    {/if}
</div>
