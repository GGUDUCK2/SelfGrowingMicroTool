<script lang="ts">
  import { encodeStego, decodeStego } from '$lib/utils/file-forge/stego';
  import { Lock, Unlock, Download, RefreshCw, AlertCircle, FileText } from '@lucide/svelte';
  import { slide } from 'svelte/transition';

  export let file: File;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let dict: Record<string, any>;

  let mode: 'encode' | 'decode' = 'encode';
  let message = '';
  let processing = false;
  let resultBlob: Blob | null = null;
  let resultUrl: string | null = null;
  let decodedMessage: string | null = null;
  let error: string | null = null;

  async function handleEncode() {
    if (!message) return;
    processing = true;
    error = null;
    resultBlob = null;
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    resultUrl = null;

    try {
      resultBlob = await encodeStego(file, message);
      resultUrl = URL.createObjectURL(resultBlob);
    } catch (e) {
      error = e.message || 'Encoding failed';
    } finally {
      processing = false;
    }
  }

  async function handleDecode() {
    processing = true;
    error = null;
    decodedMessage = null;

    try {
      decodedMessage = await decodeStego(file);
    } catch (e) {
      error = e.message || 'Decoding failed';
    } finally {
      processing = false;
    }
  }

  function download() {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `secret-${file.name.replace(/\.[^/.]+$/, "")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Reset on file change
  $: if (file) {
    resultBlob = null;
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    resultUrl = null;
    decodedMessage = null;
    error = null;
    message = '';
  }
</script>

<div class="space-y-6">
  <!-- Mode Toggle -->
  <div class="flex justify-center mb-6">
    <div class="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex">
      <button
        class="px-6 py-2 text-sm font-medium rounded-md transition-all {mode === 'encode' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}"
        on:click={() => mode = 'encode'}
      >
        <div class="flex items-center gap-2">
          <Lock size={16} /> {dict?.stego?.hide || 'Hide Secret'}
        </div>
      </button>
      <button
        class="px-6 py-2 text-sm font-medium rounded-md transition-all {mode === 'decode' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}"
        on:click={() => mode = 'decode'}
      >
        <div class="flex items-center gap-2">
          <Unlock size={16} /> {dict?.stego?.reveal || 'Reveal Secret'}
        </div>
      </button>
    </div>
  </div>

  {#if mode === 'encode'}
    <div in:slide class="space-y-4">
      <div class="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 text-sm text-indigo-800 dark:text-indigo-200">
        <p>{dict?.stego?.helpEncode || 'Enter a secret message to hide inside this image.'}</p>
      </div>

      <div>
        <label for="secret_message" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{dict?.stego?.message || 'Secret Message'}</label>
        <textarea
          id="secret_message"
          bind:value={message}
          rows="4"
          class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white resize-none"
          placeholder={dict?.stego?.placeholder || 'Type your secret here...'}
        ></textarea>
        <div class="text-right text-xs text-slate-400 mt-1">
          {message.length} chars
        </div>
      </div>

      <button
        on:click={handleEncode}
        disabled={!message || processing}
        class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {#if processing}
          <RefreshCw class="animate-spin" size={18} /> Processing...
        {:else}
          <Lock size={18} /> {dict?.stego?.encode || 'Encode & Generate Image'}
        {/if}
      </button>

      {#if resultUrl}
        <div class="mt-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 text-center animate-in fade-in slide-in-from-bottom-4">
          <div class="mb-4">
            <img src={resultUrl} alt="Secret" class="mx-auto max-h-48 rounded-lg shadow-md" />
          </div>
          <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-2">Secret Image Ready</h3>
          <p class="text-sm text-slate-500 mb-6">Download this PNG. It contains your hidden message.</p>
          <button
            on:click={download}
            class="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-md flex items-center gap-2 mx-auto transition-colors"
          >
            <Download size={18} /> {dict?.stego?.download || 'Download Image'}
          </button>
        </div>
      {/if}
    </div>
  {:else}
    <div in:slide class="space-y-6">
      <div class="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800 text-sm text-emerald-800 dark:text-emerald-200">
        <p>{dict?.stego?.helpDecode || 'If this image contains a hidden message generated by File Forge, click below to reveal it.'}</p>
      </div>

      <button
        on:click={handleDecode}
        disabled={processing}
        class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {#if processing}
          <RefreshCw class="animate-spin" size={18} /> Scanning Image...
        {:else}
          <Unlock size={18} /> {dict?.stego?.decode || 'Decode Message'}
        {/if}
      </button>

      {#if decodedMessage}
        <div class="mt-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-4">
          <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <FileText size={16} /> {dict?.stego?.found || 'Hidden Message Found'}
          </h3>
          <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 font-mono text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words">
            {decodedMessage}
          </div>
          <button
            on:click={() => navigator.clipboard.writeText(decodedMessage || '')}
            class="mt-4 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
          >
            {dict?.stego?.copy || 'Copy to Clipboard'}
          </button>
        </div>
      {/if}
    </div>
  {/if}

  {#if error}
    <div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-start gap-3 animate-in fade-in">
      <AlertCircle class="text-red-500 shrink-0 mt-0.5" size={18} />
      <p class="text-sm text-red-700 dark:text-red-300">{error}</p>
    </div>
  {/if}
</div>
