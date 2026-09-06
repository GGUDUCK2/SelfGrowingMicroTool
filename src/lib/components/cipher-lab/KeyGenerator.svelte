<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';
  import { generateKeyPair, exportKey } from '$lib/utils/cipher/keys';
  import { Copy, Save, RefreshCw, Key } from '@lucide/svelte';
  import type { CipherDictionary } from '$lib/types/cipher';

  export let dict: CipherDictionary;

  let type: 'RSA' | 'ECDSA' = 'RSA';
  let publicKey = '';
  let privateKey = '';
  let isGenerating = false;

  const dispatch = createEventDispatcher();

  async function generate() {
    isGenerating = true;
    try {
      const keyPair = await generateKeyPair(type);
      publicKey = await exportKey(keyPair.publicKey);
      privateKey = await exportKey(keyPair.privateKey);
    } catch (e) {
      console.error(e);
      publicKey = 'Error generating keys';
      privateKey = '';
    } finally {
      isGenerating = false;
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    dispatch('copy');
  }

  function saveToHistory() {
    if (publicKey) {
      dispatch('save', {
        type: 'encode', // Use generic type or 'key' if DB supported
        content: `Public Key (${type})`,
        details: `Generated ${type} Key Pair`,
        input: publicKey, // Save public key as input for reference
        settings: JSON.stringify({ type })
      });
    }
  }
</script>

<div class="space-y-6" in:slide>
  <div class="flex items-center space-x-4">
    <div class="flex-1">
      <label for="key-type" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {dict.keygen.type}
      </label>
      <select
        id="key-type"
        bind:value={type}
        class="w-full min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      >
        <option value="RSA">{dict.keygen.rsa}</option>
        <option value="ECDSA">{dict.keygen.ecdsa}</option>
      </select>
    </div>
    <div class="flex-none pt-7">
      <button
        on:click={generate}
        disabled={isGenerating}
        class="flex items-center space-x-2 px-6 py-2 min-h-[44px] min-w-[44px] bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50"
      >
        {#if isGenerating}
          <RefreshCw size={18} class="animate-spin" />
        {:else}
          <Key size={18} />
        {/if}
        <span>{dict.keygen.generate}</span>
      </button>
    </div>
  </div>

  {#if publicKey}
    <div class="grid md:grid-cols-2 gap-6" transition:slide>
      <!-- Public Key -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">{dict.keygen.public}</span>
          <button on:click={() => copy(publicKey)} class="text-xs text-slate-400 hover:text-indigo-500 min-h-[44px] min-w-[44px] flex justify-center items-center" aria-label={dict.copy}>
             <Copy size={12}/>
          </button>
        </div>
        <textarea
          readonly
          value={publicKey}
          rows="10"
          class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-[10px] text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 font-mono"
        ></textarea>
      </div>

      <!-- Private Key -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">{dict.keygen.private}</span>
          <button on:click={() => copy(privateKey)} class="text-xs text-slate-400 hover:text-indigo-500 min-h-[44px] min-w-[44px] flex justify-center items-center" aria-label={dict.copy}>
             <Copy size={12}/>
          </button>
        </div>
        <textarea
          readonly
          value={privateKey}
          rows="10"
          class="w-full rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[10px] text-red-800 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-300 font-mono"
        ></textarea>
        <p class="text-[10px] text-red-500 flex items-center gap-1">
          <Key size={10} />
          Warning: This key is generated locally. Do not share it.
        </p>
      </div>
    </div>
  {/if}
</div>
