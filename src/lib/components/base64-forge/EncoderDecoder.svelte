<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import { Copy, Trash2, Download, Upload, Image as ImageIcon, FileText, ArrowRightLeft, Settings } from '@lucide/svelte';
  import { workspace, smartSaveToHistory } from '$lib/db/workspace';
  import HistoryPanel from './HistoryPanel.svelte';

  export let dict: any;

  let mode: 'encode' | 'decode' = 'encode';
  let input = '';
  let output = '';
  let urlSafe = false;
  let strictMode = false;
  let isImageOutput = false;
  let fileInfo: { name: string; size: number; type: string } | null = null;
  let errorMsg = '';
  let copied = false;
  let debounceTimer: ReturnType<typeof setTimeout>;

  let showHistory = false;

  const TOOL_ID = 'base64-forge';

  $: if (input || mode || urlSafe || strictMode) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        processInput();
    }, 300);
  }

  function processInput() {
      errorMsg = '';
      isImageOutput = false;
      if (!input) {
          output = '';
          return;
      }

      try {
          if (mode === 'encode') {
              // Check if input is data URI
              if (input.startsWith('data:')) {
                  output = input; // Keep as is if already base64 data URI
              } else {
                  // Text encode
                  // Convert UTF-8 to base64 safely
                  const utf8Bytes = new TextEncoder().encode(input);
                  let binaryStr = '';
                  for(let i=0; i<utf8Bytes.length; i++) {
                      binaryStr += String.fromCharCode(utf8Bytes[i]);
                  }
                  let b64 = btoa(binaryStr);

                  if (urlSafe) {
                      b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
                  }
                  output = b64;
              }
          } else {
              let toDecode = input;
              if (urlSafe || toDecode.includes('-') || toDecode.includes('_')) {
                   toDecode = toDecode.replace(/-/g, '+').replace(/_/g, '/');
                   while (toDecode.length % 4) {
                       toDecode += '=';
                   }
              }

              if (strictMode) {
                  // Validate base64 regex strictly
                  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(toDecode)) {
                      throw new Error(dict.errorDecoding);
                  }
              }

              // Try to decode to UTF-8
              try {
                  const binaryStr = atob(toDecode);
                  const bytes = new Uint8Array(binaryStr.length);
                  for (let i = 0; i < binaryStr.length; i++) {
                      bytes[i] = binaryStr.charCodeAt(i);
                  }
                  output = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
              } catch(e) {
                 // Might be binary data / image
                 const binaryStr = atob(toDecode);
                 // We can display raw string or if it starts with image signature
                 // Simple signature check
                 if (binaryStr.startsWith('\x89PNG') || binaryStr.startsWith('\xff\xd8') || binaryStr.startsWith('GIF')) {
                     isImageOutput = true;
                     const mime = binaryStr.startsWith('\x89PNG') ? 'image/png' : binaryStr.startsWith('\xff\xd8') ? 'image/jpeg' : 'image/gif';
                     output = `data:${mime};base64,${toDecode}`;
                 } else {
                     output = binaryStr;
                 }
              }
          }

          saveHistory();
      } catch (err) {
          errorMsg = mode === 'encode' ? dict.errorEncoding : dict.errorDecoding;
          output = '';
      }
  }

  async function saveHistory() {
      if (!input || !output) return;
      await smartSaveToHistory(TOOL_ID, { mode, input: input.substring(0, 100) + (input.length > 100 ? '...' : ''), urlSafe, strictMode }, { outputLength: output.length });
  }

  function handleFileUpload(e: Event) {
      const target = e.target as HTMLInputElement;
      if (!target.files || !target.files[0]) return;
      const file = target.files[0];

      fileInfo = { name: file.name, size: file.size, type: file.type };

      const reader = new FileReader();
      if (mode === 'encode') {
          reader.onload = (ev) => {
             input = ev.target?.result as string;
          };
          reader.readAsDataURL(file);
      } else {
           reader.onload = (ev) => {
             input = ev.target?.result as string;
          };
          reader.readAsText(file); // Assume txt file containing base64 for decoding
      }
  }

  async function copyOutput() {
      if (!output || isImageOutput) return;
      try {
          await navigator.clipboard.writeText(output);
          copied = true;
          setTimeout(() => copied = false, 2000);
      } catch (e) {
          console.error('Failed to copy', e);
      }
  }

  function downloadOutput() {
      if (!output) return;
      const blob = isImageOutput ? dataURItoBlob(output) : new Blob([output], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = isImageOutput ? `decoded-image.${output.substring(11, output.indexOf(';'))}` : `base64-${mode}-result.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  }

  function dataURItoBlob(dataURI: string) {
      const byteString = atob(dataURI.split(',')[1]);
      const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeString });
  }

  function toggleMode() {
      mode = mode === 'encode' ? 'decode' : 'encode';
      input = output;
  }


  function handleKeydown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          toggleMode();
      }
  }

  function handleDrop(e: DragEvent) {
      e.preventDefault();
      if (!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files[0]) return;
      const file = e.dataTransfer.files[0];

      fileInfo = { name: file.name, size: file.size, type: file.type };

      const reader = new FileReader();
      if (mode === 'encode') {
          reader.onload = (ev) => {
             input = ev.target?.result as string;
          };
          reader.readAsDataURL(file);
      } else {
           reader.onload = (ev) => {
             input = ev.target?.result as string;
          };
          reader.readAsText(file);
      }
  }

  function handleDragOver(e: DragEvent) {
      e.preventDefault();
  }

  function clearAll() {
      input = '';
      output = '';
      errorMsg = '';
      fileInfo = null;
      isImageOutput = false;
  }

</script>

<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[44px] min-w-[44px]">
    <!-- Main Workspace -->
    <div class="lg:col-span-8 space-y-6">

        <!-- Controls & Toggle -->
        <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
            <div class="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                <button on:click={() => mode = 'encode'} class="px-6 py-2 rounded-lg text-sm font-semibold transition-all min-h-[44px] min-w-[44px] {mode === 'encode' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">{dict.encode}</button>
                <button on:click={() => mode = 'decode'} class="px-6 py-2 rounded-lg text-sm font-semibold transition-all min-h-[44px] min-w-[44px] {mode === 'decode' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">{dict.decode}</button>
            </div>

            <div class="flex items-center gap-4">
                {#if mode === 'encode'}
                <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer min-h-[44px]">
                    <input type="checkbox" bind:checked={urlSafe} class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-900 w-4 h-4" />
                    {dict.urlSafe}
                </label>
                {:else}
                <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer min-h-[44px]">
                    <input type="checkbox" bind:checked={strictMode} class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-900 w-4 h-4" />
                    {dict.strictMode}
                </label>
                {/if}
            </div>
        </div>

        <!-- Input Box -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-64" on:drop={handleDrop} on:dragover={handleDragOver}>
             <div class="bg-slate-50 dark:bg-slate-900 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                 <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">{dict.inputText}</span>
                 <div class="flex gap-2">
                     <label class="cursor-pointer text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1 flex items-center justify-center min-h-[44px] min-w-[44px]" title={dict.uploadFile}>
                         <Upload size={18} />
                         <input type="file" class="hidden" on:change={handleFileUpload} />
                     </label>
                     <button on:click={clearAll} class="text-slate-500 hover:text-red-500 transition-colors p-1 flex items-center justify-center min-h-[44px] min-w-[44px]" title={dict.clear}>
                         <Trash2 size={18} />
                     </button>
                 </div>
             </div>

             {#if fileInfo && input.startsWith('data:')}
                 <div class="flex-1 flex flex-col items-center justify-center p-4 bg-slate-50/50 dark:bg-slate-900/50">
                     <FileText size={48} class="text-indigo-300 dark:text-indigo-700 mb-4" />
                     <p class="font-medium text-slate-700 dark:text-slate-300">{fileInfo.name}</p>
                     <p class="text-xs text-slate-500 mt-1">{(fileInfo.size / 1024).toFixed(2)} KB • {fileInfo.type}</p>
                     <button on:click={() => { input = ''; fileInfo = null; }} class="mt-4 text-xs text-red-500 hover:underline min-h-[44px] min-w-[44px] p-2">Remove File</button>
                 </div>
             {:else}
                 <textarea
                    bind:value={input} on:keydown={handleKeydown}
                    class="flex-1 w-full p-4 bg-transparent border-none resize-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder-slate-400 font-mono text-sm outline-none"
                    placeholder="Type or paste here..."
                    spellcheck="false"
                 ></textarea>
             {/if}
        </div>

        <div class="flex justify-center -my-4 relative z-10">
            <button on:click={toggleMode} class="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg transform hover:scale-105 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Swap">
                <ArrowRightLeft size={20} class="rotate-90 md:rotate-0" />
            </button>
        </div>

        <!-- Output Box -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border {errorMsg ? 'border-red-300 dark:border-red-800' : 'border-slate-200 dark:border-slate-700'} overflow-hidden flex flex-col h-64">
            <div class="bg-slate-50 dark:bg-slate-900 px-4 py-2 border-b {errorMsg ? 'border-red-200 dark:border-red-900/50' : 'border-slate-200 dark:border-slate-700'} flex justify-between items-center">
                 <span class="text-sm font-semibold {errorMsg ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}">
                     {errorMsg || dict.outputText}
                 </span>
                 <div class="flex gap-2">
                     {#if !isImageOutput}
                     <button on:click={copyOutput} class="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1 flex items-center justify-center min-h-[44px] min-w-[44px] relative" title={dict.copy}>
                         <Copy size={18} />
                         {#if copied}
                             <span class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded" in:fade out:fade>{dict.copied}</span>
                         {/if}
                     </button>
                     {/if}
                     <button on:click={downloadOutput} class="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1 flex items-center justify-center min-h-[44px] min-w-[44px]" title={dict.downloadFile}>
                         <Download size={18} />
                     </button>
                 </div>
             </div>

             {#if isImageOutput}
                <div class="flex-1 flex items-center justify-center bg-checkered p-4 overflow-hidden relative">
                    <img src={output} alt="Decoded" class="max-h-full max-w-full object-contain shadow-sm rounded" />
                </div>
             {:else}
                <textarea
                    readonly
                    value={output}
                    class="flex-1 w-full p-4 bg-slate-50/50 dark:bg-slate-900/30 border-none resize-none focus:ring-0 text-slate-900 dark:text-slate-300 font-mono text-sm outline-none"
                ></textarea>
             {/if}
        </div>
    </div>

    <!-- Sidebar -->
    <div class="lg:col-span-4 space-y-6">
        <HistoryPanel {dict} />
    </div>
</div>

<style>
    .bg-checkered {
        background-color: #f0f0f0;
        background-image:
            linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
            linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
            linear-gradient(-45deg, transparent 75%, #e0e0e0 75%);
        background-size: 20px 20px;
        background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    }
    :global(.dark) .bg-checkered {
        background-color: #1a1a1a;
        background-image:
            linear-gradient(45deg, #2a2a2a 25%, transparent 25%),
            linear-gradient(-45deg, #2a2a2a 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #2a2a2a 75%),
            linear-gradient(-45deg, transparent 75%, #2a2a2a 75%);
    }
</style>
