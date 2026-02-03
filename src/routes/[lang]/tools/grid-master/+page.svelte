<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { getDictionary } from '$lib/dictionaries';
  import { gridStore } from '$lib/utils/grid-master/store';
  import { gridMasterWorkspace } from '$lib/db/grid-master';
  import { saveToHistory, getHistoryObservable, smartSaveToHistory } from '$lib/db/workspace';
  import { downloadProjectZip } from '$lib/utils/grid-master/export';
  import GridCanvas from '$lib/components/grid-master/GridCanvas.svelte';
  import Sidebar from '$lib/components/grid-master/Sidebar.svelte';
  import CodePanel from '$lib/components/grid-master/CodePanel.svelte';
  import ProjectList from '$lib/components/grid-master/ProjectList.svelte';
  import ShortcutsModal from '$lib/components/grid-master/ShortcutsModal.svelte';
  import { LayoutGrid, Save, RotateCcw, Check, Smartphone, Monitor, Undo2, Redo2, Eye, EyeOff, Share2, HelpCircle, History, Download } from 'lucide-svelte';
  import { fade, slide } from 'svelte/transition';
  import type { GridState } from '$lib/utils/grid-master/types';

  $: lang = $page.params.lang || 'en';
  $: dict = (getDictionary(lang) || getDictionary('en')).tools?.gridMaster || getDictionary('en').tools.gridMaster;
  $: common = getDictionary(lang).common;

  const { canUndo, canRedo } = gridStore;

  let showToast = false;
  let toastMessage = '';
  let projectName = 'My Grid';
  let viewMode: 'desktop' | 'mobile' = 'desktop';
  let previewMode = false;
  let showShortcuts = false;
  let canRestoreSession = false;
  let lastSessionState: GridState | null = null;
  let theme = 'standard';

  function handleKeydown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Global shortcuts (work even in inputs)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
          e.preventDefault();
          handleSave();
          return;
      }

      // Context-aware shortcuts (skip if typing)
      if (isInput) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
              gridStore.redo();
          } else {
              gridStore.undo();
          }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
          e.preventDefault();
          gridStore.redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
          e.preventDefault();
          previewMode = !previewMode;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          handleReset();
      }
      if (e.key === '?' && e.shiftKey) {
          e.preventDefault();
          showShortcuts = !showShortcuts;
      }
  }

  async function handleShare() {
      const data = JSON.stringify($gridStore);
      const hash = btoa(data);
      const url = `${window.location.origin}${window.location.pathname}#project=${hash}`;
      await navigator.clipboard.writeText(url);
      showToastMsg(dict.shareCopied || 'Share link copied!');
  }

  function restoreSession() {
      if (lastSessionState) {
          gridStore.load(lastSessionState);
          canRestoreSession = false;
          showToastMsg(dict.sessionRestored || 'Session restored');
      }
  }

  async function handleSave() {
      if (!projectName.trim()) return;

      await gridMasterWorkspace.save({
          name: projectName,
          ...$gridStore
      });

      // Also save to session history
      saveToHistory('grid-master', $gridStore, { name: projectName });

      showToastMsg(dict.save + ' ' + (dict.copied || 'Saved').replace('!', ''));
  }

  function handleReset() {
      if (confirm('Reset grid?')) {
          gridStore.reset();
      }
  }

  function togglePreview() {
      previewMode = !previewMode;
  }

  function showToastMsg(msg: string) {
      toastMessage = msg;
      showToast = true;
      setTimeout(() => showToast = false, 2000);
  }

  onMount(async () => {
      // Check Hash for shared project
      if (window.location.hash.includes('project=')) {
          try {
              const hash = window.location.hash.split('project=')[1];
              const data = atob(hash);
              const state = JSON.parse(data);
              gridStore.load(state);
              window.location.hash = '';
              showToastMsg('Project loaded from link');
          } catch (e) {
              console.error('Failed to load shared project', e);
          }
      } else {
          // Check for recoverable session from LocalStorage first (faster/fresher)
          const localSession = localStorage.getItem('grid-master-session');
          if (localSession) {
              try {
                  const session = JSON.parse(localSession);
                  // Valid for 24 hours
                  if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
                       lastSessionState = session.state;
                       canRestoreSession = true;
                  }
              } catch (e) { console.error(e); }
          }

          // Fallback to DB history if needed
          if (!canRestoreSession) {
              try {
                 const history = await getHistoryObservable('grid-master');
                 if (history.length > 0) {
                     const last = history[0];
                     if (Date.now() - last.timestamp < 24 * 60 * 60 * 1000) {
                         lastSessionState = last.input as GridState;
                         canRestoreSession = true;
                     }
                 }
              } catch (e) {
                  console.error(e);
              }
          }
      }

      // Auto-save loop (Debounced)
      let sessionTimeout: ReturnType<typeof setTimeout>;
      let historyTimeout: ReturnType<typeof setTimeout>;

      const unsub = gridStore.subscribe(state => {
          // 1. Fast Session Save (LocalStorage) - 1s debounce
          clearTimeout(sessionTimeout);
          sessionTimeout = setTimeout(() => {
              localStorage.setItem('grid-master-session', JSON.stringify({
                  timestamp: Date.now(),
                  state
              }));
          }, 1000);

          // 2. Smart History Save (DB) - 5s debounce
          // Only saves if content is significantly different from last save
          clearTimeout(historyTimeout);
          historyTimeout = setTimeout(() => {
              smartSaveToHistory('grid-master', state, null).catch(e => console.error('Auto-save failed', e));
          }, 5000);
      });

      return () => {
          unsub();
          clearTimeout(sessionTimeout);
          clearTimeout(historyTimeout);
      };
  });
</script>

<svelte:window on:keydown={handleKeydown} />

<svelte:head>
  <title>{dict.title} - MicroFactory</title>
  <meta name="description" content={dict.description} />
  <meta name="keywords" content="CSS Grid, Grid Layout, Tailwind Grid, Web Design, Layout Builder, CSS Generator, Grid Generator, Responsive Design, Semantic Grid, StackBlitz Export, Mobile Grid Generator, Session Snapshots, Text to Grid, Visual Grid Editor, Mock Content, Wireframing, Content Presets, Layout Gallery, Smart History, Wireframe Builder" />
  <meta property="og:title" content={dict.title} />
  <meta property="og:description" content={dict.description} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://microfactory.app/{lang}/tools/grid-master" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="canonical" href="https://microfactory.app/{lang}/tools/grid-master" />
  <link rel="alternate" hreflang="en" href="https://microfactory.app/en/tools/grid-master" />
  <link rel="alternate" hreflang="ko" href="https://microfactory.app/ko/tools/grid-master" />
  <link rel="alternate" hreflang="x-default" href="https://microfactory.app/en/tools/grid-master" />

  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Grid Master",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Web, iOS, Android, Linux, Windows, macOS",
      "applicationSubCategory": "Web Development Tool",
      "isAccessibleForFree": true,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Visual CSS Grid Editor",
        "Text-to-Grid Generative Design",
        "Interactive Widget Preview",
        "Download HTML Project",
        "Tailwind Code Generator",
        "React/Vue/Svelte Component Export",
        "Mobile Layout Generator",
        "Intelligent Preview",
        "Shareable Links",
        "Auto-Save History",
        "Smart Templates",
        "Magic Layout Generator",
        "Advanced Grid Alignment",
        "StackBlitz Export",
        "Semantic HTML Generator",
        "Interactive Gap Presets",
        "Semantic Tag Helper",
        "Session Snapshots",
        "Intelligent Mobile Stack Generator",
        "Visual Content Presets",
        "Interactive Grid Wizard"
      ]
    }
  </script>
</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white pb-20">
  <!-- Header -->
  <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
        <a href="/{lang}" aria-label={common.back} class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </a>
        <div class="flex items-center space-x-2">
          <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
             <LayoutGrid size={20} />
          </div>
          <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 hidden sm:block">
            {dict.title}
          </h1>
        </div>
      </div>

      <div class="flex items-center space-x-3">
           <div class="bg-slate-100 dark:bg-slate-800 rounded-lg p-1 hidden sm:flex">
               <button
                 class="p-1.5 rounded-md transition-all {viewMode === 'desktop' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}"
                 on:click={() => viewMode = 'desktop'}
                 aria-label="Desktop View"
               >
                   <Monitor size={16} />
               </button>
               <button
                 class="p-1.5 rounded-md transition-all {viewMode === 'mobile' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}"
                 on:click={() => viewMode = 'mobile'}
                 aria-label="Mobile View"
               >
                   <Smartphone size={16} />
               </button>
           </div>

           <div class="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block"></div>

           {#if canRestoreSession}
               <button
                 class="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                 on:click={restoreSession}
                 transition:slide={{ axis: 'x' }}
               >
                   <History size={14} />
                   {dict.restoreSession || 'Restore Session'}
               </button>
               <div class="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block" transition:fade></div>
           {/if}

           <div class="bg-slate-100 dark:bg-slate-800 rounded-lg p-1 hidden sm:flex">
               <button
                 class="p-1.5 rounded-md transition-all {$canUndo ? 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 shadow-sm' : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'}"
                 on:click={() => gridStore.undo()}
                 disabled={!$canUndo}
                 aria-label={dict.undo || 'Undo'}
               >
                   <Undo2 size={16} />
               </button>
               <button
                 class="p-1.5 rounded-md transition-all {$canRedo ? 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 shadow-sm' : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'}"
                 on:click={() => gridStore.redo()}
                 disabled={!$canRedo}
                 aria-label={dict.redo || 'Redo'}
               >
                   <Redo2 size={16} />
               </button>
           </div>

           <div class="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block"></div>

           <button
             class="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-lg transition-colors"
             on:click={togglePreview}
             aria-label={dict.preview || 'Toggle Preview'}
             title={previewMode ? 'Switch to Structure Mode' : 'Switch to Content Mode'}
           >
              {#if previewMode}
                 <EyeOff size={18} />
              {:else}
                 <Eye size={18} />
              {/if}
           </button>

           <button
             class="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-lg transition-colors"
             on:click={handleShare}
             aria-label={dict.share || 'Share'}
           >
              <Share2 size={18} />
           </button>

           <button
             class="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-lg transition-colors"
             on:click={() => downloadProjectZip($gridStore)}
             aria-label={dict.exportProject || 'Export Project'}
             title={dict.exportProject || 'Download Project ZIP'}
           >
              <Download size={18} />
           </button>

           <div class="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block"></div>

           <input
             type="text"
             bind:value={projectName}
             class="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none w-32 sm:w-48 text-sm font-medium transition-colors text-right sm:text-left text-slate-700 dark:text-slate-200"
             placeholder="Project Name"
             aria-label="Project Name"
           />

           <button
             class="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
             on:click={handleSave}
             aria-label={dict.save}
           >
              <Save size={18} />
           </button>
           <button
             class="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
             on:click={handleReset}
             aria-label={dict.clear}
           >
              <RotateCcw size={18} />
           </button>

           <button
             class="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors ml-1"
             on:click={() => showShortcuts = true}
             aria-label={dict.shortcuts || 'Shortcuts'}
           >
              <HelpCircle size={18} />
           </button>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

      <!-- Left Sidebar (Controls) -->
      <div class="lg:col-span-3 space-y-8 order-2 lg:order-1">
          <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
              <Sidebar {dict} bind:theme />
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
              <ProjectList {dict} />
          </div>
      </div>

      <!-- Main Canvas Area -->
      <div class="lg:col-span-9 space-y-6 order-1 lg:order-2">
          <!-- Canvas Container -->
          <div class="flex justify-center bg-slate-100 dark:bg-black/20 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 min-h-[500px] items-center relative overflow-hidden">
               <!-- Viewport Simulation -->
               <div
                 class="transition-all duration-500 ease-in-out bg-white dark:bg-slate-900 shadow-2xl rounded-xl overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/10"
                 style="width: {viewMode === 'desktop' ? '100%' : '375px'}; height: {viewMode === 'desktop' ? '500px' : '667px'};"
               >
                   <GridCanvas {previewMode} {viewMode} {theme} {dict} />
               </div>
          </div>

          <!-- Output Code -->
          <div class="h-64">
              <CodePanel {dict} {theme} />
          </div>

          <!-- Documentation -->
          <div class="mt-12 prose dark:prose-invert max-w-none">
              <h2 class="text-2xl font-bold">{dict.guide.title}</h2>
              <p>{dict.guide.intro}</p>

              <h3 class="text-xl font-semibold">{dict.guide.featuresTitle}</h3>
              <ul class="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose">
                 <li class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                    {@html dict.guide.f1.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-indigo-600 dark:text-indigo-400">$1</span>')}
                 </li>
                 <li class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                    {@html dict.guide.f2.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-indigo-600 dark:text-indigo-400">$1</span>')}
                 </li>
                 <li class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                    {@html dict.guide.f3.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-indigo-600 dark:text-indigo-400">$1</span>')}
                 </li>
              </ul>

              <h3 class="text-xl font-semibold mt-8">{dict.faqTitle}</h3>
              <div class="grid gap-4 not-prose">
                 <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h4 class="font-semibold text-lg mb-2">{dict.q1}</h4>
                    <p class="text-slate-600 dark:text-slate-400 leading-relaxed">{dict.a1}</p>
                 </div>
                 <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h4 class="font-semibold text-lg mb-2">{dict.q2}</h4>
                    <p class="text-slate-600 dark:text-slate-400 leading-relaxed">{dict.a2}</p>
                 </div>
                 <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h4 class="font-semibold text-lg mb-2">{dict.q3}</h4>
                    <p class="text-slate-600 dark:text-slate-400 leading-relaxed">{dict.a3}</p>
                 </div>
              </div>
          </div>
      </div>
    </div>
  </main>

  <!-- Toast -->
  {#if showToast}
    <div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50" transition:fade>
      <div class="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 font-medium text-sm">
        <Check size={18} />
        <span>{toastMessage}</span>
      </div>
    </div>
  {/if}

  {#if showShortcuts}
      <ShortcutsModal {dict} close={() => showShortcuts = false} />
  {/if}
</div>
