<script lang="ts">
  import { Upload, FileText, Clipboard } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';

  export let dict: any;

  const dispatch = createEventDispatcher();
  let dragOver = false;

  function handleFile(file: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        dispatch('load', { name: file.name, data: e.target?.result });
    };
    reader.readAsText(file);
  }

  function handleDrop(e: DragEvent) {
      e.preventDefault();
      dragOver = false;
      if (e.dataTransfer?.files?.[0]) {
          handleFile(e.dataTransfer.files[0]);
      }
  }

  function handlePaste() {
      navigator.clipboard.readText().then(text => {
          if (text) dispatch('load', { name: 'Paste ' + new Date().toLocaleTimeString(), data: text });
      });
  }

  function onInputFile(e: Event) {
      const target = e.target as HTMLInputElement;
      if (target.files?.[0]) handleFile(target.files[0]);
  }
</script>

<div
  class="relative border-2 border-dashed rounded-xl p-8 transition-all text-center flex flex-col items-center justify-center min-h-[300px] bg-slate-50 dark:bg-slate-800/50
  {dragOver ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-700'}"
  on:dragover|preventDefault={() => dragOver = true}
  on:dragleave={() => dragOver = false}
  on:drop={handleDrop}
  role="region"
  aria-label="File Upload"
>
    <div class="mb-4 p-4 bg-white dark:bg-slate-800 rounded-full shadow-lg">
        <Upload size={32} class="text-indigo-600 dark:text-indigo-400" />
    </div>

    <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">{dict.upload}</h3>
    <p class="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">{dict.guide.tip1}</p>

    <div class="flex flex-wrap gap-4 justify-center">
        <label class="btn-primary cursor-pointer flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/30">
            <FileText size={18} />
            <span>{dict.upload}</span>
            <input type="file" class="hidden" on:change={onInputFile} accept=".log,.txt,.json,.csv" />
        </label>

        <button class="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors" on:click={handlePaste}>
            <Clipboard size={18} />
            <span>{dict.paste}</span>
        </button>
    </div>

    <p class="mt-4 text-xs text-slate-400">Supported: .log, .txt, .json</p>
</div>
