<script lang="ts">
  import { onMount } from 'svelte';
  import { Copy, Check, RefreshCw } from 'lucide-svelte';
  import { calculateHash } from '$lib/utils/file-forge/hash';

  export let file: File;
  export let dict: any;

  let hashes: Record<string, string> = {
    'SHA-1': '',
    'SHA-256': '',
    'SHA-384': '',
    'SHA-512': ''
  };
  let loading = true;
  let copied: string | null = null;

  async function computeHashes() {
    loading = true;
    try {
      const algorithms = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;
      for (const algo of algorithms) {
        hashes[algo] = await calculateHash(file, algo);
      }
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text);
    copied = key;
    setTimeout(() => copied = null, 2000);
  }

  $: if (file) computeHashes();
</script>

<div class="space-y-4">
  {#if loading}
    <div class="flex items-center justify-center p-8 text-slate-500 gap-2">
        <RefreshCw class="animate-spin" size={20} />
        {dict.hash.calculating}
    </div>
  {:else}
    {#each Object.entries(hashes) as [algo, hash]}
      <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{algo}</span>
          <button
            class="text-xs flex items-center gap-1 transition-colors {copied === algo ? 'text-green-600 dark:text-green-400' : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700'}"
            on:click={() => copyToClipboard(hash, algo)}
          >
            {#if copied === algo}
              <Check size={14} />
              {dict.hash.copied}
            {:else}
              <Copy size={14} />
              {dict.hash.copy}
            {/if}
          </button>
        </div>
        <code class="block text-xs font-mono break-all text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 select-all">
          {hash}
        </code>
      </div>
    {/each}
  {/if}
</div>
