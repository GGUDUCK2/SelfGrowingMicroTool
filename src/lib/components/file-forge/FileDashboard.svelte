<script lang="ts">
  import { fade } from 'svelte/transition';
  import { db } from '$lib/db';
  import { browser } from '$app/environment';
  import { Info, Hash, FileCode, Search, Image, FileSearch } from 'lucide-svelte';
  import HashPanel from './HashPanel.svelte';
  import Base64Panel from './Base64Panel.svelte';
  import PreviewPanel from './PreviewPanel.svelte';
  import InspectorPanel from './InspectorPanel.svelte';

  export let file: File;
  export let dict: any;

  let activeTab: 'info' | 'inspector' | 'hash' | 'base64' = 'info';

  async function saveToHistory() {
    if (!browser) return;
    try {
      await db.fileForgeHistory.add({
        name: file.name,
        size: file.size,
        type: file.type,
        hash: '', // We don't force hash calc immediately to save performance, or we can update later
        createdAt: new Date(),
        starred: 0
      });
    } catch (e) {
      console.error('Failed to save history', e);
    }
  }

  $: if (file) saveToHistory();
</script>

<div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[500px] flex flex-col">
  <!-- Tabs -->
  <div class="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
    <button
      class="flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors
      {activeTab === 'info' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'text-slate-500 hover:text-indigo-500'}"
      on:click={() => activeTab = 'info'}
    >
      <Search size={16} />
      {dict.tabs.info} & {dict.tabs.preview}
    </button>
    <button
      class="flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors
      {activeTab === 'inspector' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'text-slate-500 hover:text-indigo-500'}"
      on:click={() => activeTab = 'inspector'}
    >
      <FileSearch size={16} />
      {dict.tabs.inspector || 'Inspector'}
    </button>
    <button
      class="flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors
      {activeTab === 'hash' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'text-slate-500 hover:text-indigo-500'}"
      on:click={() => activeTab = 'hash'}
    >
      <Hash size={16} />
      {dict.tabs.hash}
    </button>
    <button
      class="flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors
      {activeTab === 'base64' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'text-slate-500 hover:text-indigo-500'}"
      on:click={() => activeTab = 'base64'}
    >
      <FileCode size={16} />
      {dict.tabs.base64}
    </button>
  </div>

  <!-- Content -->
  <div class="p-6 flex-1 bg-slate-50/50 dark:bg-black/20">
    {#if activeTab === 'info'}
      <div in:fade={{ duration: 200 }}>
        <PreviewPanel {file} {dict} />
      </div>
    {:else if activeTab === 'inspector'}
      <div in:fade={{ duration: 200 }}>
        <InspectorPanel {file} {dict} />
      </div>
    {:else if activeTab === 'hash'}
      <div in:fade={{ duration: 200 }}>
        <HashPanel {file} {dict} />
      </div>
    {:else if activeTab === 'base64'}
      <div in:fade={{ duration: 200 }}>
        <Base64Panel {file} {dict} />
      </div>
    {/if}
  </div>
</div>
