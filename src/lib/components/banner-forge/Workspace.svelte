<script lang="ts">
  import { onMount } from 'svelte';
  import { toPng, toJpeg } from 'html-to-image';
  import { bannerStore } from '$lib/utils/banner-forge/store';
  import { db } from '$lib/db';
  import { slide, fade } from 'svelte/transition';

  import Canvas from './Canvas.svelte';
  import Toolbar from './Toolbar.svelte';
  import HistorySidebar from './HistorySidebar.svelte';

  export let dict: any;

  let showHistory = false;
  let toastMessage = '';
  let zoom = 0.6; // Default zoom

  function showToast(msg: string) {
      toastMessage = msg;
      setTimeout(() => toastMessage = '', 2000);
  }

  async function handleExport(format: 'png' | 'jpeg' | 'copy') {
      const node = document.getElementById('banner-canvas');
      if (!node) return;

      const loadingToast = setTimeout(() => showToast('Generating...'), 200);

      try {
          // Force full quality options
          const options = {
              quality: 0.95,
              width: $bannerStore.width,
              height: $bannerStore.height,
              style: {
                  transform: 'none', // Reset any scale on the element itself during capture
                  margin: '0'
              }
          };

          if (format === 'copy') {
              const dataUrl = await toPng(node, options);
              const res = await fetch(dataUrl);
              const blob = await res.blob();
              await navigator.clipboard.write([
                  new ClipboardItem({ 'image/png': blob })
              ]);
              clearTimeout(loadingToast);
              showToast(dict.export.copied);
          } else {
              const dataUrl = format === 'jpeg' ? await toJpeg(node, options) : await toPng(node, options);
              const link = document.createElement('a');
              link.download = `banner-forge-${Date.now()}.${format}`;
              link.href = dataUrl;
              link.click();
              clearTimeout(loadingToast);
              showToast('Downloaded');
          }
      } catch (err) {
          console.error('Export failed', err);
          clearTimeout(loadingToast);
          showToast('Export failed');
      }
  }

  async function handleSave() {
      const node = document.getElementById('banner-canvas');
      if (!node) return;

      try {
          const preview = await toJpeg(node, { quality: 0.5, pixelRatio: 0.2, width: $bannerStore.width, height: $bannerStore.height, style: { transform: 'none' } });

          await db.bannerForgeHistory.add({
              name: `Design ${new Date().toLocaleTimeString()}`,
              config: JSON.stringify($bannerStore),
              preview,
              createdAt: new Date()
          });
          showToast(dict.history.saved);
      } catch (err) {
          console.error(err);
      }
  }

  function handleRestore(e: CustomEvent) {
      bannerStore.load(e.detail);
      showHistory = false;
      showToast('Restored');
  }
</script>

<div class="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 overflow-hidden relative font-sans">

    <!-- Sidebar -->
    <aside class="w-full lg:w-80 h-[40vh] lg:h-full order-2 lg:order-1 bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 shadow-xl shrink-0">
        <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
            <h2 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span class="text-indigo-600">❖</span> Editor
            </h2>
            <button on:click={() => showHistory = !showHistory} class="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors" title={dict.history.title}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <Toolbar {dict} />
        </div>

        <div class="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-900">
            <div class="grid grid-cols-2 gap-2">
                <button on:click={() => handleExport('png')} class="px-3 py-2.5 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1">
                    PNG
                </button>
                <button on:click={() => handleExport('jpeg')} class="px-3 py-2.5 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1">
                    JPG
                </button>
            </div>
            <button on:click={handleSave} class="w-full px-3 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                {dict.history.save}
            </button>
        </div>
    </aside>

    <!-- Main Canvas Area -->
    <main class="flex-1 order-1 lg:order-2 h-[60vh] lg:h-full relative bg-slate-100 dark:bg-slate-950 overflow-hidden flex flex-col">
        <!-- Zoom Controls -->
        <div class="absolute bottom-4 left-4 lg:top-4 lg:bottom-auto z-10 flex gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
            <button on:click={() => zoom = Math.max(0.1, zoom - 0.1)} class="p-1.5 hover:bg-slate-100 rounded text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
            </button>
            <span class="text-xs font-mono w-12 flex items-center justify-center text-slate-500">{Math.round(zoom * 100)}%</span>
            <button on:click={() => zoom = Math.min(2, zoom + 0.1)} class="p-1.5 hover:bg-slate-100 rounded text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
            </button>
            <button on:click={() => zoom = 0.6} class="p-1.5 hover:bg-slate-100 rounded text-slate-600 text-xs font-bold px-2">
                Reset
            </button>
        </div>

        <div class="absolute bottom-4 right-4 lg:top-4 lg:bottom-auto z-10 flex gap-2">
             <button on:click={() => handleExport('copy')} class="p-2.5 bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 hover:text-indigo-600 transition-colors" title={dict.export.copy}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
             </button>
        </div>

        <div class="flex-1 overflow-auto flex items-center justify-center p-8 custom-scrollbar-lg">
             <div style="transform: scale({zoom}); transform-origin: center;" class="transition-transform duration-200">
                 <Canvas />
             </div>
        </div>
    </main>

    <!-- History Overlay -->
    {#if showHistory}
        <div class="absolute inset-0 z-30 flex">
            <!-- Backdrop -->
            <button class="flex-1 bg-black/20 backdrop-blur-sm cursor-default w-full h-full" on:click={() => showHistory = false} transition:fade aria-label="Close History"></button>
            <!-- Drawer -->
            <div transition:slide={{axis: 'x', duration: 300}} class="h-full">
                <HistorySidebar {dict} on:close={() => showHistory = false} on:restore={handleRestore} />
            </div>
        </div>
    {/if}

    <!-- Toast -->
    {#if toastMessage}
        <div class="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-slate-800 text-white rounded-full shadow-2xl text-sm font-medium z-50 flex items-center gap-2 animate-bounce-up" transition:slide={{axis: 'y'}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            {toastMessage}
        </div>
    {/if}
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 2px;
    }
    .custom-scrollbar:hover::-webkit-scrollbar-thumb {
        background: #94a3b8;
    }

    .custom-scrollbar-lg::-webkit-scrollbar {
        width: 10px;
        height: 10px;
    }
    .custom-scrollbar-lg::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar-lg::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 5px;
        border: 2px solid transparent;
        background-clip: content-box;
    }
    .custom-scrollbar-lg:hover::-webkit-scrollbar-thumb {
        background-color: #94a3b8;
    }
</style>
