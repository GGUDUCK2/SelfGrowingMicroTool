<script lang="ts">
  import { fade } from 'svelte/transition';

  export let policy: string = '';
  export let dictionary: any;

  let activeFormat: 'header' | 'meta' | 'nginx' | 'apache' = 'header';
  let copied = false;

  $: formattedPolicy = getFormattedPolicy(activeFormat, policy);

  function getFormattedPolicy(format: string, csp: string) {
    if (!csp) return '';

    switch(format) {
        case 'header':
            return `Content-Security-Policy: ${csp}`;
        case 'meta':
            return `<meta http-equiv="Content-Security-Policy" content="${csp}">`;
        case 'nginx':
            return `add_header Content-Security-Policy "${csp}" always;`;
        case 'apache':
            return `Header set Content-Security-Policy "${csp}"`;
        default:
            return csp;
    }
  }

  function copyToClipboard() {
    if (!formattedPolicy) return;
    navigator.clipboard.writeText(formattedPolicy);
    copied = true;
    setTimeout(() => {
        copied = false;
    }, 2000);
  }
</script>

<div class="bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-700">
  <div class="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
    <div class="flex gap-1 overflow-x-auto scrollbar-hide">
      {#each ['header', 'meta', 'nginx', 'apache'] as format}
        <button
          type="button"
          on:click={() => activeFormat = format as any}
          class="px-3 py-1.5 min-h-[44px] rounded-lg text-sm font-medium transition-colors shrink-0 {activeFormat === format ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}"
        >
          {format.charAt(0).toUpperCase() + format.slice(1)}
        </button>
      {/each}
    </div>
    <button
      type="button"
      on:click={copyToClipboard}
      class="min-h-[44px] px-3 py-1.5 flex items-center gap-2 text-sm font-medium rounded-lg transition-colors {copied ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300 hover:bg-slate-700'}"
    >
      {#if copied}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        {dictionary?.cspForge?.copied || 'Copied'}
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        {dictionary?.cspForge?.copy || 'Copy'}
      {/if}
    </button>
  </div>

  <div class="p-6 relative">
    {#if policy}
      <pre in:fade class="text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap break-all">{formattedPolicy}</pre>
    {:else}
      <div class="text-slate-500 font-mono text-sm italic">
         Select directives to build your Content Security Policy...
      </div>
    {/if}
  </div>
</div>
