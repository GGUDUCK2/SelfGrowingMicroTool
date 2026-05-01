<script lang="ts">

  import { Shield, KeyRound, Sparkles, RefreshCw } from 'lucide-svelte';
  import { generateHmac, ALGORITHMS, type HashAlgorithm } from '$lib/utils/hash-forge/crypto';
  import HashOutput from './HashOutput.svelte';
  import { saveToHistory, type HashForgeHistoryItem } from '$lib/db/hash-forge';

  export let dict: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  export let onNewHistory: () => void;
  export let restoredData: HashForgeHistoryItem | null = null;

  let message = '';
  let secret = '';
  let selectedAlgorithm: HashAlgorithm = 'SHA-256';
  let hmacResult: { hex: string, base64: string } | null = null;

  let lastSavedMessage = '';
  let lastSavedSecret = '';
  let lastSavedAlgorithm: HashAlgorithm | null = null;

  // Smart Examples
  const EXAMPLES = [
    { label: "API Webhook", secret: "whsec_12345", message: '{"event":"user.created","id":"usr_6789"}' },
    { label: "JWT Header", secret: "super-secret-key", message: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ' }
  ];

  function applyExample(exampleSecret: string, exampleMessage: string) {
    secret = exampleSecret;
    message = exampleMessage;
    handleInput();
  }

  $: if (restoredData && restoredData.type === 'hmac') {
    message = restoredData.fullMessage || restoredData.inputName;
    secret = restoredData.secret || '';
    selectedAlgorithm = restoredData.algorithm as HashAlgorithm;
    hmacResult = { hex: restoredData.result, base64: restoredData.base64Result || '' };
    restoredData = null; // Clear to prevent loops
  }

  async function computeHmac() {
    if (!message || !secret) {
      hmacResult = null;
      return;
    }
    try {
      const result = await generateHmac(message, secret, selectedAlgorithm);
      hmacResult = result;
    } catch (err) {
      console.error(err);
      hmacResult = null;
    }
  }

  async function saveCurrentToHistory() {
    if (message === null || message === undefined || !secret || !hmacResult) return;
    if (lastSavedMessage === message && lastSavedSecret === secret && lastSavedAlgorithm === selectedAlgorithm) return;

    lastSavedMessage = message;
    lastSavedSecret = secret;
    lastSavedAlgorithm = selectedAlgorithm;

    await saveToHistory({
      type: 'hmac',
      inputName: message.length > 30 ? message.substring(0, 30) + '...' : message,
      fullMessage: message,
      secret: secret,
      algorithm: selectedAlgorithm,
      result: hmacResult.hex,
      base64Result: hmacResult.base64
    });
    onNewHistory();
  }

  // Debounce the input slightly to prevent excessive re-renders
  let debounceTimer: ReturnType<typeof setTimeout>;
  function handleInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      computeHmac();
    }, 50); // fast UI update
  }

  function generateSecureKey() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    let hex = '';
    for (let i = 0; i < array.length; i++) {
        hex += array[i].toString(16).padStart(2, '0');
    }
    secret = hex;
    handleInput();
  }

  // Handle keyboard shortcuts
  function handleKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      message = '';
      secret = '';
      hmacResult = null;
    }
  }

  $: if (selectedAlgorithm && message !== undefined && secret !== undefined) handleInput();
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="space-y-6">
  <!-- Algorithm Selection -->
  <div class="flex flex-wrap gap-2">
    {#each ALGORITHMS as algo (algo)}
      <button
        class="px-4 py-2 min-h-[44px] min-w-[44px] rounded-lg text-sm font-medium transition-all {selectedAlgorithm === algo ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}"
        on:click={() => selectedAlgorithm = algo}
        aria-label="Select algorithm {algo}"
      >
        {algo}
      </button>
    {/each}
  </div>

  <!-- Smart Examples -->
  <div class="flex flex-wrap items-center gap-2">
    <span class="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
      <Sparkles size={14} /> {dict?.common?.examples || "Examples"}:
    </span>
    {#each EXAMPLES as example (example.label)}
      <button
        class="px-3 py-1.5 min-h-[44px] min-w-[44px] text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors font-medium border border-indigo-100 dark:border-indigo-800"
        on:click={() => applyExample(example.secret, example.message)}
        aria-label={`Load example ${example.label}`}
      >
        {example.label}
      </button>
    {/each}
  </div>

  <div class="space-y-4">
    <div>
      <div class="flex items-center justify-between mb-1">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <KeyRound size={16} class="text-indigo-500" />
          {dict.hmac.secretLabel}
        </label>
        <button
          on:click={generateSecureKey}
          class="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors min-h-[44px] min-w-[44px]"
        >
          <RefreshCw size={14} />
          {dict?.hmac?.generateKey || "Generate Secure Key"}
        </button>
      </div>
      <input
        type="text"
        bind:value={secret}
        on:input={handleInput}
        on:blur={saveCurrentToHistory}
        placeholder={dict.hmac.secretPlaceholder}
        class="w-full px-4 py-3 min-h-[44px] min-w-[44px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400 font-mono"
        aria-label={dict.hmac.secretLabel}
      />
    </div>

    <div>
      <div class="flex items-center justify-between mb-1">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Shield size={16} class="text-indigo-500" />
          {dict.textHash.inputLabel}
        </label>
        <span class="text-xs text-slate-400">Ctrl+K to clear</span>
      </div>
      <textarea
        bind:value={message}
        on:input={handleInput}
        on:blur={saveCurrentToHistory}
        placeholder={dict.textHash.placeholder}
        class="w-full h-32 px-4 py-3 min-h-[44px] min-w-[44px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl resize-y focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400 font-mono"
        aria-label={dict.textHash.inputLabel}
      ></textarea>
    </div>
  </div>

  {#if hmacResult}
    <div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <HashOutput
        result={hmacResult}
        label="HMAC Signature"
        uppercase={false}
        dict={dict}
      />
    </div>
  {/if}
</div>
