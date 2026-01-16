<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import { Copy, Download, Check } from 'lucide-svelte';
  import { browser } from '$app/environment';

  export let code = '';
  export let language = 'sql';

  let copied = false;
  let codeElement: HTMLElement;

  async function highlight() {
      if (browser && codeElement) {
          const Prism = (await import('prismjs')).default;
          await import('prismjs/components/prism-sql');
          await import('prismjs/components/prism-typescript');
          // Prisma isn't standard in basic prism package sometimes, using clike or typescript fallback often works,
          // or we try to import it if available.
          // await import('prismjs/components/prism-prisma');

          Prism.highlightElement(codeElement);
      }
  }

  $: if (code && browser) {
      setTimeout(highlight, 0);
  }

  function handleCopy() {
      navigator.clipboard.writeText(code);
      copied = true;
      setTimeout(() => copied = false, 2000);
  }

  function handleDownload() {
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `schema.${language === 'typescript' ? 'ts' : 'sql'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  }
</script>

<div class="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden flex flex-col group">
    <div class="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
            class="p-2 bg-slate-800 text-slate-300 hover:text-white rounded shadow-sm border border-slate-700 transition-colors"
            on:click={handleCopy}
            title="Copy"
        >
            {#if copied}
                <Check size={16} class="text-green-400" />
            {:else}
                <Copy size={16} />
            {/if}
        </button>
        <button
            class="p-2 bg-slate-800 text-slate-300 hover:text-white rounded shadow-sm border border-slate-700 transition-colors"
            on:click={handleDownload}
            title="Download"
        >
            <Download size={16} />
        </button>
    </div>

    <div class="flex-1 overflow-auto p-4 custom-scrollbar">
        <pre class="!bg-transparent !m-0 !p-0"><code bind:this={codeElement} class="language-{language}">{code}</code></pre>
    </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #475569;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #64748b;
  }
</style>
