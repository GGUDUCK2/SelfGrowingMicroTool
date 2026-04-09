<script lang="ts">
  import { onMount } from 'svelte';
  import { Check, Copy } from 'lucide-svelte';

  export let code: string;
  export let language: string = 'docker';

  let copied = false;
  let codeElement: HTMLElement;
  let Prism: any;

  onMount(async () => {
      // Dynamic import to avoid SSR issues and global scope conflicts
      const prismModule = await import('prismjs');
      Prism = prismModule.default || prismModule;

      // Load languages side-effects
      // Note: In some setups, we might need to manually set window.Prism before importing components
      if (typeof window !== 'undefined') {
          (window as any).Prism = Prism;
      }

      await import('prismjs/components/prism-docker');
      await import('prismjs/components/prism-yaml');
      await import('prismjs/components/prism-bash');

      highlight();
  });

  $: if (code && Prism) {
      highlight();
  }

  function highlight() {
      // Small timeout to ensure DOM and languages are ready
      setTimeout(() => {
         if (codeElement && Prism) {
             const grammar = Prism.languages[language] || Prism.languages.plaintext;
             codeElement.innerHTML = Prism.highlight(code, grammar, language);
         }
      }, 0);
  }

  async function copy() {
      await navigator.clipboard.writeText(code);
      copied = true;
      setTimeout(() => copied = false, 2000);
  }
</script>

<div class="relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-900/50">
    <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
            class="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-md border border-slate-700 shadow-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
            on:click={copy}
            aria-label="Copy code"
        >
            {#if copied}
                <Check size={16} class="text-emerald-400" />
            {:else}
                <Copy size={16} />
            {/if}
        </button>
    </div>
    <div class="p-4 overflow-x-auto text-sm font-mono max-h-[500px] overflow-y-auto custom-scrollbar">
        <pre class="!bg-transparent !p-0 !m-0"><code class="language-{language}" bind:this={codeElement}>{code}</code></pre>
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
    background: #334155;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #475569;
  }
</style>
