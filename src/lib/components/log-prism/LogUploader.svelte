<script lang="ts">
  import { Upload, FileText, Clipboard, Play } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';
  import { generateNginxLog, generateSyslog, generateJsonLog } from '$lib/utils/log-prism/generators';

  export let dict: Record<string, any>;

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

  function loadExample(type: 'nginx' | 'syslog' | 'json') {
      let data = '';
      if (type === 'nginx') data = generateNginxLog();
      if (type === 'syslog') data = generateSyslog();
      if (type === 'json') data = generateJsonLog();

      dispatch('load', { name: `Example ${type.toUpperCase()}`, data });
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

    <div class="flex flex-wrap gap-4 justify-center mb-8">
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

    <div class="border-t border-slate-200 dark:border-slate-700 pt-6 w-full max-w-md">
        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{dict.examples?.label || 'Or try an example'}</p>
        <div class="grid grid-cols-3 gap-3">
             <button
                class="flex flex-col items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-sm font-medium text-slate-600 dark:text-slate-300"
                on:click={() => loadExample('nginx')}
                aria-label="Load Nginx Example"
             >
                <div class="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                    <Play size={14} fill="currentColor" />
                </div>
                Nginx
             </button>

             <button
                class="flex flex-col items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-sm font-medium text-slate-600 dark:text-slate-300"
                on:click={() => loadExample('syslog')}
                aria-label="Load Syslog Example"
             >
                <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Play size={14} fill="currentColor" />
                </div>
                Syslog
             </button>

             <button
                class="flex flex-col items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-sm font-medium text-slate-600 dark:text-slate-300"
                on:click={() => loadExample('json')}
                aria-label="Load JSON Example"
             >
                 <div class="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Play size={14} fill="currentColor" />
                </div>
                JSON
             </button>
        </div>
    </div>

    <p class="mt-6 text-xs text-slate-400">Supported: .log, .txt, .json</p>
</div>
