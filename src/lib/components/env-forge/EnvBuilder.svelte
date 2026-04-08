<script lang="ts">
  import { onMount } from 'svelte';
  import EnvEditor from './EnvEditor.svelte';
  import EnvFormatter from './EnvFormatter.svelte';
  import EnvValidator from './EnvValidator.svelte';
  import EnvExporter from './EnvExporter.svelte';
  import HistoryPanel from './HistoryPanel.svelte';
  import { workspace } from '$lib/db/workspace';

  export let lang: string;
  export let t: any;
  export let showToast: (msg: string, type?: 'success' | 'error') => void;

  let activeTab = 'formatter';
  let content = '';

  const TOOL_ID = 'env-forge';

  onMount(async () => {
      // Load last session
      const last = await workspace.history.where('toolId').equals(TOOL_ID).reverse().first();
      if (last && typeof last.input === 'string') {
          content = last.input;
      }
  });

  async function handleContentChange(e: CustomEvent<string>) {
      content = e.detail;
      await saveState();
  }

  async function handleLoadHistory(e: CustomEvent<string>) {
      content = e.detail;
      showToast('History loaded successfully', 'success');
  }

  async function saveState() {
      if (!content.trim()) return;

      const lastItems = await workspace.history.where('toolId').equals(TOOL_ID).reverse().sortBy('timestamp');
      if (lastItems.length > 0) {
          if (lastItems[0].input === content) return; // Prevent duplicate consecutive saves
      }

      await workspace.history.add({
          toolId: TOOL_ID,
          input: content,
          result: null,
          timestamp: Date.now(),
          starred: false
      });
  }

  function handleSaveShortcut(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          saveState();
          copyToClipboard();
      }
  }

  function copyToClipboard() {
      if (!content) return;
      navigator.clipboard.writeText(content).then(() => {
          showToast(t.toasts.copied, 'success');
      });
  }

  function downloadFile() {
      if (!content) return;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '.env';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(t.toasts.downloaded, 'success');
  }

  const tabs = [
      { id: 'formatter', label: t.tabs.formatter, icon: '<path d="M11 5h10"></path><path d="M11 9h7"></path><path d="M11 13h4"></path><path d="M3 17l3 3 3-3"></path><path d="M6 18V4"></path>' },
      { id: 'validator', label: t.tabs.validator, icon: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>' },
      { id: 'exporter', label: t.tabs.exporter, icon: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>' },
      { id: 'history', label: t.tabs.history, icon: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>' }
  ];
</script>

<svelte:window on:keydown={handleSaveShortcut} />

<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
  <!-- Left Column: Editor -->
  <div class="lg:col-span-7 flex flex-col space-y-4">
      <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              {t.editorTitle}
          </h2>
          <div class="flex items-center gap-2">
              <button class="min-h-[44px] min-w-[44px] px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition font-medium flex items-center gap-2" on:click={copyToClipboard}>
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  {t.copy}
              </button>
              <button class="min-h-[44px] min-w-[44px] px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center gap-2 shadow-md shadow-indigo-500/20" on:click={downloadFile}>
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  {t.download}
              </button>
          </div>
      </div>
      <div class="flex-grow">
          <EnvEditor bind:content {t} on:change={handleContentChange} />
      </div>
  </div>

  <!-- Right Column: Tools Panel -->
  <div class="lg:col-span-5 flex flex-col space-y-6">

      <!-- Tab Navigation -->
      <div class="overflow-x-auto scrollbar-hide whitespace-nowrap bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-xl flex gap-1 shadow-inner">
          {#each tabs as tab}
              <button
                  class="shrink-0 min-h-[44px] min-w-[44px] flex-1 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 {activeTab === tab.id ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'}"
                  on:click={() => activeTab = tab.id}
              >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      {@html tab.icon}
                  </svg>
                  {tab.label}
              </button>
          {/each}
      </div>

      <!-- Tab Content -->
      <div class="flex-grow">
          {#if activeTab === 'formatter'}
              <EnvFormatter bind:content {t} on:change={(e) => { handleContentChange(e); showToast(t.toasts.formatted, 'success'); }} />
          {:else if activeTab === 'validator'}
              <EnvValidator {content} {t} />
          {:else if activeTab === 'exporter'}
              <EnvExporter {content} {t} />
          {:else if activeTab === 'history'}
              <HistoryPanel {t} on:load={handleLoadHistory} />
          {/if}
      </div>

  </div>
</div>