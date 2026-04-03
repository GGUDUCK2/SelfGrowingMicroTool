<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { slide, fade } from 'svelte/transition';
  import { computeHash, computeHmac } from '$lib/utils/cipher/hashing';
  import { Copy, Save, Search, Wand2, FileUp, Zap, Sparkles } from 'lucide-svelte';
  import type { CipherDictionary } from '$lib/types/cipher';

  export let dict: CipherDictionary;

  let input = '';
  let key = '';
  let output = '';
  let algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512' = 'SHA-256';
  let mode: 'hash' | 'hmac' = 'hash';
  let isBulk = false;
  let isCalculating = false;
  let detectedType: string | null = null;
  let isDragOver = false;

  interface SavedState {
    input?: string;
    settings?: string;
  }

  // Restore state method
  export const restore = (savedState: SavedState) => {
    input = savedState.input || '';
    if (savedState.settings) {
       const settings = JSON.parse(savedState.settings);
       algorithm = settings.algorithm || 'SHA-256';
       mode = settings.mode || 'hash';
       key = settings.key || '';
    }
  };

  const dispatch = createEventDispatcher();

  async function calculate() {
    if (!input) {
      output = '';
      detectedType = null;
      return;
    }

    // Auto-detect if input looks like a hash
    detectHashType(input);

    isCalculating = true;
    try {
      if (isBulk) {
        const lines = input.split('\n');
        const promises = lines.map(async (line) => {
          if (!line.trim()) return '';
          if (mode === 'hmac') {
             return key ? await computeHmac(line, key, algorithm) : '';
          } else {
             return await computeHash(line, algorithm);
          }
        });
        const results = await Promise.all(promises);
        output = results.join('\n');
      } else {
        if (mode === 'hmac') {
          if (!key) {
             output = ''; // Wait for key
             isCalculating = false;
             return;
          }
          output = await computeHmac(input, key, algorithm);
        } else {
          output = await computeHash(input, algorithm);
        }
      }
    } catch (e) {
      console.error(e);
      output = 'Error calculating hash';
    } finally {
      isCalculating = false;
    }
  }

  function detectHashType(str: string) {
    const len = str.trim().length;
    const isHex = /^[0-9a-fA-F]+$/.test(str.trim());

    if (!isHex) {
      detectedType = null;
      return;
    }

    if (len === 32) detectedType = 'MD5';
    else if (len === 40) detectedType = 'SHA-1';
    else if (len === 64) detectedType = 'SHA-256';
    else if (len === 96) detectedType = 'SHA-384';
    else if (len === 128) detectedType = 'SHA-512';
    else detectedType = null;
  }

  // Reactive calculation with debounce
  let debounceTimer: ReturnType<typeof setTimeout>;
  $: {
    if (input || (mode === 'hmac' && key)) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        calculate();
      }, 300);
    } else {
      output = '';
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(output);
    dispatch('copy');
  }

  function saveToHistory() {
    if (output) {
      dispatch('save', {
        type: mode === 'hmac' ? 'hmac' : 'hash',
        content: output,
        details: `${algorithm} ${mode === 'hmac' ? '(HMAC)' : ''}`,
        input: input,
        settings: JSON.stringify({ algorithm, mode, key })
      });
    }
  }

  // --- Creative Features ---

  // 1. File Hashing (Drag & Drop)
  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragOver = false;

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      readFile(file);
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDragOver = true;
  }

  function handleDragLeave() {
    isDragOver = false;
  }

  function readFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        input = result;
      }
    };
    reader.readAsText(file);
  }

  function triggerFileInput() {
    const el = document.getElementById('file-upload');
    if (el) el.click();
  }

  function handleFileSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      readFile(target.files[0]);
    }
  }

  // 2. Keyboard Shortcuts
  onMount(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to Copy
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (output) copyToClipboard();
      }
      // Ctrl/Cmd + Enter to Force Calculate (if not auto)
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        calculate();
      }
      // Ctrl/Cmd + K to Clear
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        input = '';
        output = '';
        key = '';
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });

  // 3. Smart Examples
  function loadExample(type: 'text' | 'json' | 'log') {
    if (type === 'text') {
      input = "The quick brown fox jumps over the lazy dog";
    } else if (type === 'json') {
      input = '{"id": 1, "name": "Cipher Lab", "secure": true}';
    } else if (type === 'log') {
      isBulk = true;
      input = "User login: admin\nFailed attempt: 192.168.1.1\nTransaction: #88229";
    }
  }
</script>

<div class="space-y-6" in:slide>

  <!-- Top Controls -->
  <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
      <!-- Mode Selection -->
      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <label for="mode" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {dict.mode}
          </label>
          <label class="flex items-center space-x-2 text-xs text-slate-500 cursor-pointer select-none">
             <input type="checkbox" bind:checked={isBulk} class="rounded text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-600" />
             <span class="font-medium text-indigo-600 dark:text-indigo-400">{dict.hashing.bulk}</span>
          </label>
        </div>
        <div class="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
          <button
            class="flex-1 py-1.5 text-sm font-medium rounded-md transition-all {mode === 'hash' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}"
            on:click={() => (mode = 'hash')}
            aria-label="Switch to Hash mode"
          >
            Hash
          </button>
          <button
            class="flex-1 py-1.5 text-sm font-medium rounded-md transition-all {mode === 'hmac' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}"
            on:click={() => (mode = 'hmac')}
            aria-label="Switch to HMAC mode"
          >
            HMAC
          </button>
        </div>
      </div>

      <!-- Algorithm Selection -->
      <div class="space-y-2">
        <label for="algo" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {dict.algo}
        </label>
        <select
          id="algo"
          bind:value={algorithm}
          class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          <option value="SHA-1">{dict.hashing.sha1}</option>
          <option value="SHA-256">{dict.hashing.sha256}</option>
          <option value="SHA-384">{dict.hashing.sha384}</option>
          <option value="SHA-512">{dict.hashing.sha512}</option>
        </select>
      </div>
    </div>
  </div>

  <!-- Smart Examples -->
  <div class="flex gap-2 overflow-x-auto scrollbar-hide whitespace-nowrap text-xs">
    <span class="text-slate-500 py-1 font-medium select-none">Try:</span>
    <button on:click={() => loadExample('text')} class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">
      Simple Text
    </button>
    <button on:click={() => loadExample('json')} class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">
      JSON Data
    </button>
    <button on:click={() => loadExample('log')} class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">
      Log File (Bulk)
    </button>
  </div>

  <!-- Inputs -->
  <div class="space-y-4">
    <div class="space-y-2 relative">
      <div class="flex justify-between items-center">
        <label for="input" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {dict.input}
        </label>
        <div class="flex items-center space-x-3">
           {#if detectedType}
             <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center animate-pulse" transition:fade>
                <Wand2 size={12} class="mr-1"/> Looks like {detectedType}
             </span>
           {/if}
           <button on:click={triggerFileInput} class="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors" aria-label="Upload File">
             <FileUp size={12} /> <span>Upload</span>
           </button>
        </div>
      </div>

      <!-- Drag & Drop Zone -->
      <div
        class="relative"
        role="region"
        aria-label="Input Area"
        on:dragover={handleDragOver}
        on:dragleave={handleDragLeave}
        on:drop={handleDrop}
      >
        <textarea
          id="input"
          bind:value={input}
          rows="4"
          class="w-full rounded-lg border {isDragOver ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'} px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white font-mono transition-all"
          placeholder="Type here or drag & drop a text file..."
        ></textarea>
        {#if isDragOver}
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none bg-white/80 dark:bg-slate-900/80 rounded-lg backdrop-blur-sm" transition:fade>
            <div class="text-center text-indigo-600 dark:text-indigo-400">
               <FileUp size={32} class="mx-auto mb-2" />
               <span class="font-bold">Drop text file here</span>
            </div>
          </div>
        {/if}
      </div>
      <input type="file" id="file-upload" class="hidden" on:change={handleFileSelect} accept=".txt,.json,.log,.md,.csv,.xml,.yml,.yaml" />
    </div>

    {#if mode === 'hmac'}
      <div class="space-y-2" transition:slide>
        <label for="key" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {dict.key}
        </label>
        <div class="relative">
          <input
            id="key"
            type="text"
            bind:value={key}
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono pl-8"
            placeholder="Enter secret key..."
          />
          <Zap size={14} class="absolute left-2.5 top-2.5 text-slate-400" />
        </div>
      </div>
    {/if}
  </div>

  <!-- Output -->
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <label for="output" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {dict.output}
      </label>
      <div class="flex space-x-2">
        <button
          on:click={copyToClipboard}
          class="flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          disabled={!output}
          aria-label={dict.copy}
        >
          <Copy size={14} />
          <span>{dict.copy}</span>
          <span class="hidden sm:inline text-slate-400 ml-1 text-[10px]">(⌘S)</span>
        </button>
        <button
          on:click={saveToHistory}
          class="flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          disabled={!output}
          aria-label={dict.save}
        >
          <Save size={14} />
          <span>{dict.save}</span>
        </button>
      </div>
    </div>
    <div class="relative">
      <textarea
        id="output"
        value={output}
        readonly
        rows="2"
        class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 font-mono break-all"
        aria-label="Hash Result"
      ></textarea>
      {#if isCalculating}
        <div class="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 rounded-lg backdrop-blur-[1px]" transition:fade>
          <div class="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-lg">
             <Sparkles size={14} class="animate-spin" />
             <span class="text-xs font-medium">{dict.calculating}</span>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
