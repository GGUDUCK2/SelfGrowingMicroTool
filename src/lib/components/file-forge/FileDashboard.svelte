<script lang="ts">
  import { fade } from 'svelte/transition';
  import { db } from '$lib/db';
  import { browser } from '$app/environment';
  import { dictionaries } from '$lib/dictionaries';
  import { Hash, FileCode, Search, FileSearch, ArrowRightLeft, Image, Lock, Download, AlertCircle, Star, Shield, Share2 } from 'lucide-svelte';
  import { generateReport, type AnalysisData } from '$lib/utils/file-forge/report';
  import HashPanel from './HashPanel.svelte';
  import Base64Panel from './Base64Panel.svelte';
  import PreviewPanel from './PreviewPanel.svelte';
  import InspectorPanel from './InspectorPanel.svelte';
  import ConvertPanel from './ConvertPanel.svelte';
  import ComparePanel from './ComparePanel.svelte';
  import StegoPanel from './StegoPanel.svelte';
  import PrivacyPanel from './PrivacyPanel.svelte';

  export let file: File | null;

  export let dict: typeof dictionaries.en.tools.fileForge;
  export let restoredData: AnalysisData | null = null;

  let activeTab: 'info' | 'inspector' | 'hash' | 'base64' | 'convert' | 'compare' | 'stego' | 'privacy' = 'info';
  let currentHistoryId: number | undefined;
  let analysisData: AnalysisData = {};
  let starred = false;

  $: isImage = file?.type.startsWith('image/');
  $: isRestored = !file && !!restoredData;

  $: if (restoredData) {
      analysisData = restoredData;
      // In restored mode, we can't easily check if it was starred without passing the full object
      // But usually restoredData is just the data blob.
      // If we want star status here, we'd need to pass it in props.
      // For now, assume false or rely on the sidebar to show star status.
  }

  // Watch file changes to reset state and save history
  $: if (file) {
    analysisData = {};
    starred = false;
    saveToHistory();
    if (!isImage && (activeTab === 'convert' || activeTab === 'stego')) {
      activeTab = 'info';
    }
  }

  async function saveToHistory() {
    if (!browser || !file) return;
    try {
      // Store blob if < 5MB to avoid quota issues
      const blob = file.size < 5 * 1024 * 1024 ? file : undefined;

      const id = await db.fileForgeHistory.add({
        name: file.name,
        size: file.size,
        type: file.type,
        hash: '',
        createdAt: new Date(),
        starred: 0,
        data: '',
        blob: blob
      });
      currentHistoryId = id as number;

      // Limit history to 100 items (keep starred ones)
      const count = await db.fileForgeHistory.where('starred').equals(0).count();
      if (count > 100) {
        const oldest = await db.fileForgeHistory
            .where('starred')
            .equals(0)
            .sortBy('createdAt');

        const toDelete = oldest.slice(0, count - 100);
        await db.fileForgeHistory.bulkDelete(toDelete.map(i => i.id!));
      }
    } catch (e) {
      console.error('Failed to save history', e);
    }
  }

  async function handleShare() {
    const text = generateReport(file, analysisData);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `File Forge Analysis: ${file?.name}`,
          text: text.substring(0, 500) + '...', // Share preview or link
          url: window.location.href
        });
      } catch (e) { console.error(e); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(dict?.shareCopied || 'Link copied!');
    }
  }

  async function toggleStar() {
    if (!currentHistoryId || !browser) return;
    try {
      starred = !starred;
      await db.fileForgeHistory.update(currentHistoryId, { starred: starred ? 1 : 0 });
    } catch (e) {
      console.error(e);
      starred = !starred; // Revert on error
    }
  }

  async function updateHistoryData() {
      if (currentHistoryId && browser) {
          try {
            await db.fileForgeHistory.update(currentHistoryId, {
                data: JSON.stringify(analysisData)
            });
          } catch(e) { console.error(e); }
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

  function handleAllHashes(event: CustomEvent<Record<string, string>>) {
      analysisData.hashes = event.detail;
      updateHistoryData();
  }

  function handleInspectorAnalysis(event: CustomEvent) {
      analysisData = { ...analysisData, ...event.detail };
      updateHistoryData();
  }

  function downloadReport() {
      const text = generateReport(file, analysisData);
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `file-forge-report-${file?.name || 'analysis'}.txt`;
      a.click();
      URL.revokeObjectURL(url);
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      downloadReport();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[600px] flex flex-col">
  <!-- Tabs -->
  <div class="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-hide pr-20 relative">
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
    {#if file && (isImage || file.type === 'application/pdf')}
      <button
        class="flex-1 min-w-[100px] py-4 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap outline-none focus:bg-slate-50 dark:focus:bg-slate-800
        {activeTab === 'privacy' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'text-slate-500 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}"
        on:click={() => activeTab = 'privacy'}
        aria-label={dict.tabs.privacy || 'Privacy'}
      >
        <Shield size={16} />
        {dict.tabs.privacy || 'Privacy'}
      </button>
    {/if}
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

    <div class="absolute right-0 top-0 h-full flex items-center pr-4 bg-gradient-to-l from-white via-white to-transparent dark:from-slate-900 dark:via-slate-900 pl-8 pointer-events-none">
        <button
            on:click={handleShare}
            class="pointer-events-auto p-3 min-h-[44px] mr-2 text-slate-400 hover:text-indigo-500 transition-colors focus:ring-2 focus:ring-indigo-500 rounded-lg outline-none"
            title={dict?.share || 'Share'}
            aria-label={dict?.share || 'Share'}
        >
            <Share2 size={18} />
        </button>
        {#if currentHistoryId}
            <button
                on:click={toggleStar}
                class="pointer-events-auto p-3 min-h-[44px] mr-2 text-slate-400 hover:text-yellow-400 transition-colors focus:ring-2 focus:ring-yellow-400 rounded-lg outline-none {starred ? 'text-yellow-400' : ''}"
                title={dict?.star || 'Star this analysis'}
                aria-label={dict?.star || 'Star this analysis'}
            >
                <Star size={18} fill={starred ? "currentColor" : "none"} />
            </button>
        {/if}
        <button
            on:click={downloadReport}
            class="pointer-events-auto flex items-center gap-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 min-h-[44px] py-2 rounded-lg transition-colors whitespace-nowrap shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            title={dict?.downloadReport || 'Download Report'}
            aria-label={dict?.downloadReport || 'Download Report'}
        >
            <Download size={14} />
            <span class="hidden sm:inline">{dict?.downloadReport || 'Report'}</span>
        </button>
    </div>
  </div>

  {#if isRestored}
      <div class="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 px-6 py-2 text-xs font-medium flex items-center gap-2 border-b border-amber-100 dark:border-amber-800/50">
          <AlertCircle size={14} />
          {dict?.restoredMode || 'Viewing history record. Original file access is restricted.'}
      </div>
  {/if}

  <!-- Content -->
  <div class="p-6 flex-1 bg-slate-50/50 dark:bg-black/20 overflow-y-auto min-h-[500px]">
    {#if activeTab === 'info'}
      <div in:fade={{ duration: 200 }}>
        <PreviewPanel {file} {dict} />
      </div>
    {:else if activeTab === 'inspector'}
      <div in:fade={{ duration: 200 }}>
        <InspectorPanel {file} {dict} on:analysisComplete={handleInspectorAnalysis} {restoredData} />
      </div>
    {:else if activeTab === 'hash'}
      <div in:fade={{ duration: 200 }}>
        <HashPanel {file} {dict} on:hashCalculated={handleHashCalculated} on:allHashesCalculated={handleAllHashes} {restoredData} />
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
    {:else if activeTab === 'privacy' && file}
      <div in:fade={{ duration: 200 }}>
        <PrivacyPanel {file} {dict} />
      </div>
    {/if}
  </div>
</div>
