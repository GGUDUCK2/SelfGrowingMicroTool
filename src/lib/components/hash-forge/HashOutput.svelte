<script lang="ts">
  import { Copy, Check, CheckCircle2, XCircle } from 'lucide-svelte';

  export let result: { hex: string, base64: string } | null = null;
  export let label: string = 'Hash Result';
  export let uppercase: boolean = false;
  export let dict: any;

  let expectedHash = '';
  let copiedHex = false;
  let copiedBase64 = false;

  $: displayHexValue = uppercase && result ? result.hex.toUpperCase() : (result ? result.hex : '');

  $: isMatch = expectedHash && result && (expectedHash.toLowerCase() === result.hex.toLowerCase() || expectedHash === result.base64);

  async function copyToClipboard(text: string, type: 'hex' | 'base64') {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'hex') {
        copiedHex = true;
        setTimeout(() => copiedHex = false, 2000);
      } else {
        copiedBase64 = true;
        setTimeout(() => copiedBase64 = false, 2000);
      }
    } catch (err) {
      console.error('Failed to copy', err);
    }
  }
</script>

<div class="space-y-6">
  <!-- Expected Hash Input -->
  <div>
    <label for="expected-hash-input" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
      {dict?.common?.expectedHash || "Expected Hash"}
    </label>
    <div class="relative">
      <input
        id="expected-hash-input"
        type="text"
        bind:value={expectedHash}
        placeholder={dict?.common?.expectedHashPlaceholder || "Paste expected hex or base64 to verify..."}
        class="w-full px-4 py-3 min-h-[44px] min-w-[44px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400 font-mono pr-12"
        aria-label="Expected Hash"
      />
      {#if expectedHash && result}
        <div class="absolute right-3 top-1/2 -translate-y-1/2">
          {#if isMatch}
            <div class="flex items-center gap-1 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md text-xs font-medium border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 size={14} />
              {dict?.common?.match || "Match"}
            </div>
          {:else}
            <div class="flex items-center gap-1 text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md text-xs font-medium border border-red-200 dark:border-red-800">
              <XCircle size={14} />
              {dict?.common?.mismatch || "Mismatch"}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <!-- Hex Output -->
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <span class="block text-sm font-medium text-slate-700 dark:text-slate-300">{label} (Hex)</span>
      <div class="flex items-center gap-2">
        <label class="flex items-center gap-2 text-xs text-slate-500 min-h-[44px] min-w-[44px] dark:text-slate-400 cursor-pointer">
          <input type="checkbox" bind:checked={uppercase} class="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800" />
          {dict?.common?.uppercase || "UPPERCASE"}
        </label>
        <button
          on:click={() => copyToClipboard(displayHexValue, 'hex')}
          disabled={!result}
          class="flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] min-w-[44px] text-xs font-medium rounded-md transition-colors {copiedHex ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'} disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Copy hex hash to clipboard"
          title="Copy"
        >
          {#if copiedHex}
            <Check size={14} /> {dict?.common?.copied || "Copied!"}
          {:else}
            <Copy size={14} /> {dict?.common?.copy || "Copy"}
          {/if}
        </button>
      </div>
    </div>

    <div
      class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 font-mono text-sm break-all text-slate-800 dark:text-slate-200 min-h-[60px] cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
      on:click={() => copyToClipboard(displayHexValue, 'hex')}
      on:keydown={(e) => e.key === 'Enter' && copyToClipboard(displayHexValue, 'hex')}
      tabindex="0"
      role="button"
      aria-label="Click to copy hex hash"
    >
      {result ? displayHexValue : '...'}
    </div>
  </div>

  <!-- Base64 Output -->
  {#if result && result.base64}
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="block text-sm font-medium text-slate-700 dark:text-slate-300">{label} (Base64)</span>
        <button
          on:click={() => copyToClipboard(result?.base64 || '', 'base64')}
          disabled={!result}
          class="flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] min-w-[44px] text-xs font-medium rounded-md transition-colors {copiedBase64 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'} disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Copy base64 hash to clipboard"
          title="Copy"
        >
          {#if copiedBase64}
            <Check size={14} /> {dict?.common?.copied || "Copied!"}
          {:else}
            <Copy size={14} /> {dict?.common?.copy || "Copy"}
          {/if}
        </button>
      </div>

      <div
        class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 font-mono text-sm break-all text-slate-800 dark:text-slate-200 min-h-[60px] cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
        on:click={() => copyToClipboard(result?.base64 || '', 'base64')}
        on:keydown={(e) => e.key === 'Enter' && copyToClipboard(result?.base64 || '', 'base64')}
        tabindex="0"
        role="button"
        aria-label="Click to copy base64 hash"
      >
        {result.base64}
      </div>
    </div>
  {/if}
</div>
