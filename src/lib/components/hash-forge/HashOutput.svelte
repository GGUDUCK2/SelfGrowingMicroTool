<script lang="ts">
  import { Copy, Check } from 'lucide-svelte';

  export let value: string = '';
  export let label: string = 'Hash Result';
  export let uppercase: boolean = false;

  let copied = false;

  $: displayValue = uppercase ? value.toUpperCase() : value;

  async function copyToClipboard() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(displayValue);
      copied = true;
      setTimeout(() => copied = false, 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  }
</script>

<div class="space-y-2">
  <div class="flex items-center justify-between">
    <span class="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
    <div class="flex items-center gap-2">
      <label class="flex items-center gap-2 text-xs text-slate-500 min-h-[44px] min-w-[44px] dark:text-slate-400 cursor-pointer">
        <input type="checkbox" bind:checked={uppercase} class="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800" />
        UPPERCASE
      </label>
      <button
        on:click={copyToClipboard}
        disabled={!value}
        class="flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] min-w-[44px] text-xs font-medium rounded-md transition-colors {copied ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'} disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Copy hash to clipboard"
        title="Copy"
      >
        {#if copied}
          <Check size={14} /> Copied!
        {:else}
          <Copy size={14} /> Copy
        {/if}
      </button>
    </div>
  </div>

  <div
    class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 font-mono text-sm break-all text-slate-800 dark:text-slate-200 min-h-[60px] cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
    on:click={copyToClipboard}
    on:keydown={(e) => e.key === 'Enter' && copyToClipboard()}
    tabindex="0"
    role="button"
    aria-label="Click to copy hash"
  >
    {value ? displayValue : '...'}
  </div>
</div>
