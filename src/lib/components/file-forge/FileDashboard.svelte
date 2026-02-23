<script lang="ts">
  import { fade } from 'svelte/transition';
  import { db } from '$lib/db';
  import { browser } from '$app/environment';
  import { Hash, FileCode, Search, FileSearch, ArrowRightLeft, Image, Lock } from 'lucide-svelte';
  import HashPanel from './HashPanel.svelte';
  import Base64Panel from './Base64Panel.svelte';
  import PreviewPanel from './PreviewPanel.svelte';
  import InspectorPanel from './InspectorPanel.svelte';
  import ConvertPanel from './ConvertPanel.svelte';
  import ComparePanel from './ComparePanel.svelte';
  import StegoPanel from './StegoPanel.svelte';

  export let file: File;
  export let dict: any;

  let activeTab: 'info' | 'inspector' | 'hash' | 'base64' | 'convert' | 'compare' | 'stego' = 'info';
  let currentHistoryId: number | undefined;

  $: isImage = file?.type.startsWith('image/');

  // Watch file changes to reset state and save history
  $: if (file) {
    saveToHistory();
    // Default to info tab on file switch, or keep user preference if they are browsing multiple files?
    // Usually standard behavior is reset, but let's keep it sticky if suitable.
    // However, if switching from image to non-image, 'convert' tab might break.
    if (!isImage && (activeTab === 'convert' || activeTab === 'stego')) {
      activeTab = 'info';
    }
  }

  async function saveToHistory() {
    if (!browser) return;
    try {
      const id = await db.fileForgeHistory.add({
        name: file.name,
        size: file.size,
        type: file.type,
        hash: '',
        createdAt: new Date(),
        starred: 0
      });
      currentHistoryId = id as number;
    } catch (e) {
      console.error('Failed to save history', e);
    }
  }

  async function handleHashCalculated(event: CustomEvent<string>) {
    if (currentHistoryId && browser) {
      try {
        await db.fileForgeHistory.update(currentHistoryId, { hash: event.detail });
      } catch (e) {
        console.error('Failed to update history hash', e);
      }
    }
  }
</script>

<div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[600px] flex flex-col">
  <!-- Tabs -->
  <div class="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-hide">
    <button
      class="flex-1 min-w-[100px] py-4 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap outline-none focus:bg-slate-50 dark:focus:bg-slate-800
      {activeTab === 'info' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'text-slate-500 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}"
      on:click={() => activeTab = 'info'}
      aria-label={dict.tabs.info}
    >
      <Search size={16} />
      {dict.tabs.info}
    </button>
    <button
      class="flex-1 min-w-[100px] py-4 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap outline-none focus:bg-slate-50 dark:focus:bg-slate-800
      {activeTab === 'inspector' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'text-slate-500 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}"
      on:click={() => activeTab = 'inspector'}
      aria-label={dict.tabs.inspector || 'Inspector'}
    >
      <FileSearch size={16} />
      {dict.tabs.inspector || 'Inspector'}
    </button>
    <button
      class="flex-1 min-w-[100px] py-4 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap outline-none focus:bg-slate-50 dark:focus:bg-slate-800
      {activeTab === 'hash' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'text-slate-500 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}"
      on:click={() => activeTab = 'hash'}
      aria-label={dict.tabs.hash}
    >
      <Hash size={16} />
      {dict.tabs.hash}
    </button>
    {#if isImage}
      <button
        class="flex-1 min-w-[100px] py-4 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap outline-none focus:bg-slate-50 dark:focus:bg-slate-800
        {activeTab === 'convert' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'text-slate-500 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}"
        on:click={() => activeTab = 'convert'}
        aria-label={dict.tabs.convert || 'Convert'}
      >
        <Image size={16} />
        {dict.tabs.convert || 'Convert'}
      </button>
      <button
        class="flex-1 min-w-[100px] py-4 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap outline-none focus:bg-slate-50 dark:focus:bg-slate-800
        {activeTab === 'stego' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'text-slate-500 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}"
        on:click={() => activeTab = 'stego'}
        aria-label="Secret Forge"
      >
        <Lock size={16} />
        Secret
      </button>
    {/if}
    <button
      class="flex-1 min-w-[100px] py-4 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap outline-none focus:bg-slate-50 dark:focus:bg-slate-800
      {activeTab === 'compare' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'text-slate-500 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}"
      on:click={() => activeTab = 'compare'}
      aria-label={dict.tabs.compare || 'Compare'}
    >
      <ArrowRightLeft size={16} />
      {dict.tabs.compare || 'Compare'}
    </button>
    <button
      class="flex-1 min-w-[100px] py-4 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap outline-none focus:bg-slate-50 dark:focus:bg-slate-800
      {activeTab === 'base64' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'text-slate-500 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}"
      on:click={() => activeTab = 'base64'}
      aria-label={dict.tabs.base64}
    >
      <FileCode size={16} />
      {dict.tabs.base64}
    </button>
  </div>

  <!-- Content -->
  <div class="p-6 flex-1 bg-slate-50/50 dark:bg-black/20 overflow-y-auto min-h-[500px]">
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
        <HashPanel {file} {dict} on:hashCalculated={handleHashCalculated} />
      </div>
    {:else if activeTab === 'convert' && isImage}
      <div in:fade={{ duration: 200 }}>
        <ConvertPanel {file} {dict} />
      </div>
    {:else if activeTab === 'stego' && isImage}
      <div in:fade={{ duration: 200 }}>
        <StegoPanel {file} {dict} />
      </div>
    {:else if activeTab === 'compare'}
      <div in:fade={{ duration: 200 }}>
        <ComparePanel {file} {dict} />
      </div>
    {:else if activeTab === 'base64'}
      <div in:fade={{ duration: 200 }}>
        <Base64Panel {file} {dict} />
      </div>
    {/if}
  </div>
</div>
