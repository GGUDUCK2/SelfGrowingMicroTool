<script lang="ts">
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';
  import { fade, slide } from 'svelte/transition';
  import { db } from '$lib/db';
  import { Keyboard, Gamepad2, MousePointer2, Monitor, History, Save, Check, RotateCcw } from 'lucide-svelte';

  import KeyboardTester from '$lib/components/input-lab/KeyboardTester.svelte';
  import GamepadTester from '$lib/components/input-lab/GamepadTester.svelte';
  import PointerTester from '$lib/components/input-lab/PointerTester.svelte';
  import ScreenInfo from '$lib/components/input-lab/ScreenInfo.svelte';
  import EventLog from '$lib/components/input-lab/EventLog.svelte';
  import HistoryPanel from '$lib/components/input-lab/HistoryPanel.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang).tools.inputLab;
  $: common = getDictionary(lang).common;

  $: jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": dict.title,
        "description": dict.description,
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Any",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
            dict.guide.f1.replace(/\*\*(.*?)\*\*/g, '$1'),
            dict.guide.f2.replace(/\*\*(.*?)\*\*/g, '$1'),
            dict.guide.f3.replace(/\*\*(.*?)\*\*/g, '$1')
        ]
      },
    ]
  };

  let activeTab: 'keyboard' | 'gamepad' | 'pointer' | 'screen' | 'history' = 'keyboard';
  let events: any[] = [];
  let showToast = false;
  let toastMessage = '';

  function handleLog(event: any) {
      // Limit log size
      if (events.length > 500) events = events.slice(0, 499);
      events = [event, ...events];
  }

  function handleClearLog() {
      events = [];
      showToastMsg('Log cleared');
  }

  function handleLoad(data: any) {
      if (Array.isArray(data)) {
          events = data;
          activeTab = 'history';
          showToastMsg('Session loaded');
      }
  }

  async function saveSession() {
      if (events.length === 0) {
          showToastMsg('Nothing to save');
          return;
      }

      await db.inputLabHistory.add({
          type: activeTab === 'history' ? 'keyboard' : activeTab as any, // Default to keyboard if on history tab
          data: JSON.stringify(events),
          createdAt: new Date(),
          starred: 0
      });
      showToastMsg('Session saved to history');
  }

  function showToastMsg(msg: string) {
    toastMessage = msg;
    showToast = true;
    setTimeout(() => (showToast = false), 2000);
  }
</script>

<svelte:head>
  <title>{dict.title} - MicroTools</title>
  <meta name="description" content={dict.description} />
  <meta name="keywords" content="keyboard tester, gamepad tester, input lag test, ghosting check, pointer events, touch test, device info, keycode checker" />

  <!-- Open Graph -->
  <meta property="og:title" content={dict.title} />
  <meta property="og:description" content={dict.description} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://web-factory.vercel.app/{lang}/tools/input-lab" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={dict.title} />
  <meta name="twitter:description" content={dict.description} />

  <link rel="canonical" href="https://web-factory.vercel.app/{lang}/tools/input-lab" />
  <link rel="alternate" hreflang="en" href="https://web-factory.vercel.app/en/tools/input-lab" />
  <link rel="alternate" hreflang="ko" href="https://web-factory.vercel.app/ko/tools/input-lab" />

  {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white pb-20">
  <!-- Header -->
  <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <a href="/{lang}" aria-label={common.back} class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </a>
        <div class="flex items-center space-x-2">
          <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
             <Keyboard size={20} />
          </div>
          <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            {dict.title}
          </h1>
        </div>
      </div>

      <div class="flex items-center space-x-2">
           <button
             class="h-9 px-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium text-sm flex items-center gap-2"
             on:click={saveSession}
           >
              <Save size={16} />
              <span class="hidden sm:inline">Save Session</span>
           </button>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

      <!-- Main Content -->
      <div class="lg:col-span-8 space-y-6">
         <!-- Tabs -->
         <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-1.5 flex flex-nowrap overflow-x-auto gap-1 hide-scrollbar" role="tablist">
             <button
                 role="tab"
                 aria-selected={activeTab === 'keyboard'}
                 class="flex-none whitespace-nowrap flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeTab === 'keyboard' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'}"
                 on:click={() => activeTab = 'keyboard'}
             >
                 <Keyboard size={16} />
                 <span>{dict.tabs.keyboard}</span>
             </button>
             <button
                 role="tab"
                 aria-selected={activeTab === 'gamepad'}
                 class="flex-none whitespace-nowrap flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeTab === 'gamepad' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'}"
                 on:click={() => activeTab = 'gamepad'}
             >
                 <Gamepad2 size={16} />
                 <span>{dict.tabs.gamepad}</span>
             </button>
             <button
                 role="tab"
                 aria-selected={activeTab === 'pointer'}
                 class="flex-none whitespace-nowrap flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeTab === 'pointer' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'}"
                 on:click={() => activeTab = 'pointer'}
             >
                 <MousePointer2 size={16} />
                 <span>{dict.tabs.pointer}</span>
             </button>
             <button
                 role="tab"
                 aria-selected={activeTab === 'screen'}
                 class="flex-none whitespace-nowrap flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeTab === 'screen' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'}"
                 on:click={() => activeTab = 'screen'}
             >
                 <Monitor size={16} />
                 <span>{dict.tabs.screen}</span>
             </button>
             <button
                 role="tab"
                 aria-selected={activeTab === 'history'}
                 class="flex-none whitespace-nowrap flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeTab === 'history' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'}"
                 on:click={() => activeTab = 'history'}
             >
                 <History size={16} />
                 <span>{dict.tabs.history}</span>
             </button>
         </div>

         <!-- Active Component -->
         <div class="min-h-[400px]">
             {#if activeTab === 'keyboard'}
                 <KeyboardTester {dict} onLog={handleLog} />
             {:else if activeTab === 'gamepad'}
                 <GamepadTester {dict} onLog={handleLog} />
             {:else if activeTab === 'pointer'}
                 <PointerTester {dict} onLog={handleLog} />
             {:else if activeTab === 'screen'}
                 <ScreenInfo {dict} />
             {:else if activeTab === 'history'}
                 <EventLog {dict} {events} onClear={handleClearLog} />
             {/if}
         </div>

      </div>

      <!-- Sidebar -->
      <div class="lg:col-span-4 space-y-6">
          <div class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 sticky top-24">
             <HistoryPanel {dict} onLoad={handleLoad} />
          </div>
      </div>

    </div>

    <GuideSection
      title={dict.guide.title}
      intro={dict.guide.intro}
      featuresTitle={dict.guide.featuresTitle}
      f1={dict.guide.f1}
      f2={dict.guide.f2}
      f3={dict.guide.f3}
      tipsTitle={dict.guide.tipsTitle}
      tip1={dict.guide.tip1}
      tip2={dict.guide.tip2}
      tip3={dict.guide.tip3}
    />

    <FAQSection title={dict.faqTitle} items={[
      { q: dict.q1, a: dict.a1 },
      { q: dict.q2, a: dict.a2 },
      { q: dict.q3, a: dict.a3 }
    ]} />
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
</div>
