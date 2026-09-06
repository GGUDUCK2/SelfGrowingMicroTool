<script lang="ts">
  import { onMount } from 'svelte';
  import EnvEditor from './EnvEditor.svelte';
  import EnvFormatter from './EnvFormatter.svelte';
  import EnvValidator from './EnvValidator.svelte';
  import EnvExporter from './EnvExporter.svelte';
  import EnvCompare from './EnvCompare.svelte';
  import HistoryPanel from './HistoryPanel.svelte';
  import { workspace } from '$lib/db/workspace';

  export let t: Record<string, any>;
  export let showToast: (msg: string, type?: 'success' | 'error') => void;

  let activeTab = 'formatter';
  let content = '';
  let isTemplatesOpen = false;

  const TOOL_ID = 'env-forge';

  onMount(async () => {
      // Load last session
      const last = await workspace.history.where('toolId').equals(TOOL_ID).reverse().first();
      if (last && typeof last.input === 'string') {
          content = last.input;
      }
  });

  let autoSaveTimeout: ReturnType<typeof setTimeout>;
  async function handleContentChange(e: CustomEvent<string>) {
      content = e.detail;
      if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
      autoSaveTimeout = setTimeout(async () => {
          await saveState();
      }, 1500);
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

      // Keep only last 100 items
      const allItems = await workspace.history.where('toolId').equals(TOOL_ID).sortBy('timestamp');
      if (allItems.length > 100) {
          const itemsToDelete = allItems.slice(0, allItems.length - 100);
          const idsToDelete = itemsToDelete.filter(i => !i.starred).map(i => i.id!);
          if (idsToDelete.length > 0) {
              await workspace.history.bulkDelete(idsToDelete);
          }
      }
  }


  function handleSaveShortcut(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          saveState();
          copyToClipboard();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          content = '';
          showToast('Editor cleared', 'success');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          activeTab = 'formatter';
          showToast(t.tabs.formatter + ' mode enabled', 'success');
      } else if (e.key === 'Escape') {
          content = '';
      }
  }



  async function shareContent() {
      if (!content) return;
      if (navigator.share) {
          try {
              await navigator.share({
                  title: 'Env Forge Configuration',
                  text: content
              });
              showToast(t.toasts?.shared || 'Shared successfully', 'success');
          } catch (err) {
              if (err.name !== 'AbortError') {
                  showToast(t.toasts?.shareError || 'Failed to share', 'error');
              }
          }
      } else {
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
      { id: 'compare', label: t.tabs.compare, icon: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>' },
      { id: 'exporter', label: t.tabs.exporter, icon: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>' },
      { id: 'history', label: t.tabs.history, icon: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>' }
  ];
</script>

<svelte:window on:keydown={handleSaveShortcut} />

<div class="grid lg:grid-cols-12 gap-8">
  <!-- Left Column: Editor -->
  <div class="lg:col-span-7 flex flex-col space-y-4">
      <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              {t.editorTitle}
          </h2>
          <div class="flex items-center gap-2 relative">
              <div class="relative">
                  <button aria-expanded={isTemplatesOpen} aria-haspopup="true" class="min-h-[44px] min-w-[44px] px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-800/50 transition font-medium text-sm flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-amber-500" on:click={() => isTemplatesOpen = !isTemplatesOpen}>
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                      {t.templates}
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 ml-1 transition-transform {isTemplatesOpen ? 'rotate-180' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </button>
                  {#if isTemplatesOpen}
                  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
                  <div class="fixed inset-0 z-40" on:click={() => isTemplatesOpen = false}></div>
                  <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 transition-all z-50 overflow-hidden">
                      <button class="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition focus:bg-slate-100 dark:focus:bg-slate-700 min-h-[44px]" on:click={() => { content = "PORT=3000\nDATABASE_URL=postgres://user:pass@localhost:5432/db\nAPI_KEY=sk_test_12345\nDEBUG=true"; isTemplatesOpen = false; handleContentChange(new CustomEvent('change', {detail: content})); }}>
                          Generic
                      </button>
                      <button class="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition focus:bg-slate-100 dark:focus:bg-slate-700 min-h-[44px]" on:click={() => { content = "# Next.js Example\nNEXT_PUBLIC_API_URL=http://localhost:3000/api\nNEXTAUTH_URL=http://localhost:3000\nNEXTAUTH_SECRET=generate_a_random_secret_here\nDATABASE_URL=postgres://user:pass@localhost:5432/nextjs_db"; isTemplatesOpen = false; handleContentChange(new CustomEvent('change', {detail: content})); }}>
                          Next.js
                      </button>
                      <button class="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition focus:bg-slate-100 dark:focus:bg-slate-700 min-h-[44px]" on:click={() => { content = "# SvelteKit Example\nPUBLIC_SUPABASE_URL=https://your-project.supabase.co\nPUBLIC_SUPABASE_ANON_KEY=your_anon_key\nSUPABASE_SERVICE_ROLE_KEY=your_service_role_key"; isTemplatesOpen = false; handleContentChange(new CustomEvent('change', {detail: content})); }}>
                          SvelteKit + Supabase
                      </button>
                  </div>
                  {/if}
              </div>
              <button class="min-h-[44px] min-w-[44px] px-4 py-2 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition font-medium gap-2" on:click={copyToClipboard}>
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  {t.copy}
              </button>
              <button class="min-h-[44px] min-w-[44px] px-4 py-2 flex items-center justify-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium gap-2 shadow-md shadow-indigo-500/20" on:click={downloadFile}>
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  {t.download}
              </button>
              <button class="min-h-[44px] min-w-[44px] px-4 py-2 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition font-medium gap-2" on:click={shareContent}>
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                  {t.share || 'Share'}
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
          {:else if activeTab === 'compare'}
              <EnvCompare {content} {t} />
          {:else if activeTab === 'exporter'}
              <EnvExporter {content} {t} />
          {:else if activeTab === 'history'}
              <HistoryPanel {t} on:load={handleLoadHistory} />
          {/if}
      </div>

  </div>
</div>