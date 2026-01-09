<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';
  import { encryptData, decryptData } from '$lib/utils/cipher/encryption';
  import { Copy, Lock, Unlock, ShieldAlert, Save } from 'lucide-svelte';
  import type { CipherDictionary } from '$lib/types/cipher';

  export let dict: CipherDictionary;

  let mode: 'encrypt' | 'decrypt' = 'encrypt';
  let input = '';
  let password = '';
  let result = '';
  let isProcessing = false;
  let error = '';

  const dispatch = createEventDispatcher();

  async function process() {
    error = '';
    result = '';
    if (!input || !password) return;

    isProcessing = true;
    try {
      if (mode === 'encrypt') {
        result = await encryptData(input, password);
      } else {
        result = await decryptData(input, password);
      }
    } catch (e: any) {
      error = e.message || 'Operation failed';
    } finally {
      isProcessing = false;
    }
  }

  function copyResult() {
    navigator.clipboard.writeText(result);
    dispatch('copy');
  }

  function saveToHistory() {
    if (result) {
      dispatch('save', {
        type: mode === 'encrypt' ? 'encode' : 'decode', // Using existing types, or map to 'vault' if added
        content: mode === 'encrypt' ? 'Encrypted Data (Hidden)' : 'Decrypted Data (Hidden)',
        details: `AES-GCM ${mode === 'encrypt' ? 'Encryption' : 'Decryption'}`,
        input: '', // Don't save sensitive input
        settings: JSON.stringify({ mode }) // Don't save password!
      });
    }
  }
</script>

<div class="space-y-6" in:slide>
  <!-- Mode Switch -->
  <div class="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 w-full md:w-1/2">
    <button
      class="flex-1 py-1.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 {mode === 'encrypt' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}"
      on:click={() => { mode = 'encrypt'; input = ''; result = ''; error = ''; }}
    >
      <Lock size={14} />
      <span>{dict.vault?.encrypt || 'Encrypt'}</span>
    </button>
    <button
      class="flex-1 py-1.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 {mode === 'decrypt' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}"
      on:click={() => { mode = 'decrypt'; input = ''; result = ''; error = ''; }}
    >
      <Unlock size={14} />
      <span>{dict.vault?.decrypt || 'Decrypt'}</span>
    </button>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Input Section -->
    <div class="space-y-4">
      <div class="space-y-2">
        <label for="vault-input" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {mode === 'encrypt' ? (dict.vault?.plainText || 'Plain Text') : (dict.vault?.encryptedText || 'Encrypted Text')}
        </label>
        <textarea
          id="vault-input"
          bind:value={input}
          rows="5"
          class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono placeholder:text-slate-400"
          placeholder={mode === 'encrypt' ? "Enter secret message..." : "Paste encrypted string..."}
        ></textarea>
      </div>

      <div class="space-y-2">
        <label for="vault-password" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {dict.vault?.password || 'Password'}
        </label>
        <input
          id="vault-password"
          type="password"
          bind:value={password}
          class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          placeholder="Enter encryption password"
        />
        <p class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <ShieldAlert size={12} />
          {dict.vault?.warning || 'Warning: If you lose this password, the data cannot be recovered.'}
        </p>
      </div>

      <button
        on:click={process}
        disabled={!input || !password || isProcessing}
        class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center gap-2"
      >
        {#if isProcessing}
           <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
           <span>Processing...</span>
        {:else}
           {#if mode === 'encrypt'}
             <Lock size={16} />
             <span>Encrypt</span>
           {:else}
             <Unlock size={16} />
             <span>Decrypt</span>
           {/if}
        {/if}
      </button>

      {#if error}
        <div class="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2" in:slide>
          <ShieldAlert size={16} />
          {error}
        </div>
      {/if}
    </div>

    <!-- Output Section -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <label for="vault-output" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {dict.output}
        </label>
        <div class="flex space-x-2">
           <button
             on:click={copyResult}
             disabled={!result}
             class="flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-50"
             aria-label={dict.copy}
           >
             <Copy size={14} />
             <span>{dict.copy}</span>
           </button>
           <button
             on:click={saveToHistory}
             disabled={!result}
             class="flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-50"
             aria-label={dict.save}
           >
             <Save size={14} />
             <span>{dict.save}</span>
           </button>
        </div>
      </div>
      <textarea
        id="vault-output"
        readonly
        value={result}
        rows="10"
        class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 font-mono break-all focus:outline-none"
        placeholder={mode === 'encrypt' ? "Encrypted result will appear here..." : "Decrypted message will appear here..."}
      ></textarea>
    </div>
  </div>
</div>
