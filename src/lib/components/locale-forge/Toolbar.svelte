<script lang="ts">
  import { projectStore } from '$lib/utils/locale-forge/store';
  import { unflatten } from '$lib/utils/locale-forge/flattener';
  import JSZip from 'jszip';
  import { Download, Wand2, Trash2 } from 'lucide-svelte';

  function autoFill() {
      const languages = $projectStore.languages;
      if (languages.length < 2) return;

      const sourceLang = languages[0]; // Assume first is source

      projectStore.update(store => {
          const newData = store.data.map(item => {
              const newItem = { ...item, values: { ...item.values } };
              const sourceValue = newItem.values[sourceLang];

              if (sourceValue) {
                  languages.forEach(lang => {
                      if (!newItem.values[lang]) {
                          newItem.values[lang] = `[TODO] ${sourceValue}`;
                      }
                  });
              }
              return newItem;
          });
          return { ...store, data: newData };
      });
  }

  function clearAll() {
      if(confirm('Clear all data?')) {
          projectStore.set({
              name: 'Untitled Project',
              languages: ['en'],
              data: [],
              createdAt: new Date(),
              updatedAt: new Date()
          });
      }
  }

  async function exportFiles() {
      const zip = new JSZip();
      const languages = $projectStore.languages;

      languages.forEach(lang => {
          const flatObj: Record<string, string> = {};
          $projectStore.data.forEach(item => {
              if (item.values[lang]) {
                  flatObj[item.key] = item.values[lang];
              }
          });

          const nested = unflatten(flatObj);
          zip.file(`${lang}.json`, JSON.stringify(nested, null, 2));
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `locales-${new Date().toISOString().slice(0,10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  }
</script>

<div class="flex items-center gap-2 overflow-x-auto scrollbar-hide whitespace-nowrap p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
    <button
        class="flex items-center gap-2 px-3 py-2 min-h-[44px] min-w-[44px] text-sm font-medium text-indigo-600 bg-white dark:bg-slate-700 dark:text-indigo-400 rounded-md shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
        on:click={autoFill}
        title="Fill missing translations with source language"
    >
        <Wand2 size={16} />
        Auto-Fill
    </button>

    <div class="flex-1 hidden sm:block"></div>

    <button
        class="flex items-center gap-2 px-3 py-2 min-h-[44px] min-w-[44px] text-sm font-medium text-slate-600 bg-white dark:bg-slate-700 dark:text-slate-300 rounded-md shadow-sm hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        on:click={clearAll}
    >
        <Trash2 size={16} />
        Clear
    </button>

    <div class="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1 hidden sm:block"></div>

    <button
        class="flex items-center gap-2 px-4 py-2 min-h-[44px] min-w-[44px] text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 transition-colors"
        on:click={exportFiles}
    >
        <Download size={16} />
        Export ZIP
    </button>
</div>
