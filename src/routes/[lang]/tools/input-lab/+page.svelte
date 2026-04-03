<script lang="ts">
  import Head from '$lib/components/Head.svelte';
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
        "isAccessibleForFree": true,
        "name": dictionary.title,
        "description": dictionary.description,
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Any",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
            dictionary.guide.f1.replace(/\*\*(.*?)\*\*/g, '$1'),
            dictionary.guide.f2.replace(/\*\*(.*?)\*\*/g, '$1'),
            dictionary.guide.f3.replace(/\*\*(.*?)\*\*/g, '$1')
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
<Head
  title={dictionary.title}
  description={dictionary.description}
  keywords="keyboard tester, gamepad tester, input lag test, ghosting check, pointer events, touch test, device info, keycode checker"
/>


<svelte:head>

  <!-- Twitter -->

    <link rel="alternate" hreflang="en" href="https://web-factory.vercel.app/en/tools/input-lab" />
  <link rel="alternate" hreflang="ko" href="https://web-factory.vercel.app/ko/tools/input-lab" />

  {@html '<script type="application/ld+json">' + JSON.stringify(jsonLd) + '</script>'}

  {@html `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "${dictionary.q1}",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "${dictionary.a1}"
        }
      },
      {
        "@type": "Question",
        "name": "${dictionary.q2}",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "${dictionary.a2}"
        }
      },
      {
        "@type": "Question",
        "name": "${dictionary.q3}",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "${dictionary.a3}"
        }
      }
    ]
  }
  </script>`}

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
            {dictionary.title}
          </h1>
        </div>
      </div>

      <div class="flex items-center space-x-2">
           <button
             class="h-9 px-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium text-sm flex items-center gap-2 min-h-[44px]"
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
                 class="flex-none whitespace-nowrap flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeTab === 'keyboard' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'} min-h-[44px]"
                 on:click={() => activeTab = 'keyboard'}
             >
                 <Keyboard size={16} />
                 <span>{dictionary.tabs.keyboard}</span>
             </button>
             <button
                 role="tab"
                 aria-selected={activeTab === 'gamepad'}
                 class="flex-none whitespace-nowrap flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeTab === 'gamepad' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'} min-h-[44px]"
                 on:click={() => activeTab = 'gamepad'}
             >
                 <Gamepad2 size={16} />
                 <span>{dictionary.tabs.gamepad}</span>
             </button>
             <button
                 role="tab"
                 aria-selected={activeTab === 'pointer'}
                 class="flex-none whitespace-nowrap flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeTab === 'pointer' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'} min-h-[44px]"
                 on:click={() => activeTab = 'pointer'}
             >
                 <MousePointer2 size={16} />
                 <span>{dictionary.tabs.pointer}</span>
             </button>
             <button
                 role="tab"
                 aria-selected={activeTab === 'screen'}
                 class="flex-none whitespace-nowrap flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeTab === 'screen' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'} min-h-[44px]"
                 on:click={() => activeTab = 'screen'}
             >
                 <Monitor size={16} />
                 <span>{dictionary.tabs.screen}</span>
             </button>
             <button
                 role="tab"
                 aria-selected={activeTab === 'history'}
                 class="flex-none whitespace-nowrap flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeTab === 'history' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'} min-h-[44px]"
                 on:click={() => activeTab = 'history'}
             >
                 <History size={16} />
                 <span>{dictionary.tabs.history}</span>
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
      title={dictionary.guide.title}
      intro={dictionary.guide.intro}
      featuresTitle={dictionary.guide.featuresTitle}
      f1={dictionary.guide.f1}
      f2={dictionary.guide.f2}
      f3={dictionary.guide.f3}
      tipsTitle={dictionary.guide.tipsTitle}
      tip1={dictionary.guide.tip1}
      tip2={dictionary.guide.tip2}
      tip3={dictionary.guide.tip3}
    />

    <FAQSection title={dictionary.faqTitle} items={[
      { q: dictionary.q1, a: dictionary.a1 },
      { q: dictionary.q2, a: dictionary.a2 },
      { q: dictionary.q3, a: dictionary.a3 }
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
