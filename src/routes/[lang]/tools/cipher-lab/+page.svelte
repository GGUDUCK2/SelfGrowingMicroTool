<script lang="ts">
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';
  import { fade, slide } from 'svelte/transition';
  import { db } from '$lib/db';
  import HashGenerator from '$lib/components/cipher-lab/HashGenerator.svelte';
  import EncoderDecoder from '$lib/components/cipher-lab/EncoderDecoder.svelte';
  import JwtDebugger from '$lib/components/cipher-lab/JwtDebugger.svelte';
  import PasswordForge from '$lib/components/cipher-lab/PasswordForge.svelte';
  import HistoryPanel from '$lib/components/cipher-lab/HistoryPanel.svelte';
  import { Shield, Hash, Code, Key, Lock, Check, Star } from 'lucide-svelte';
  import { onMount, onDestroy } from 'svelte';

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang).tools.cipherLab;
  $: common = getDictionary(lang).common;

  let activeTab: 'hash' | 'encoders' | 'jwt' | 'password' = 'hash';
  let showToast = false;
  let toastMessage = '';

  // Component References
  let hashComponent: HashGenerator;
  let encoderComponent: EncoderDecoder;
  let jwtComponent: JwtDebugger;
  let passwordComponent: PasswordForge;

  function handleSave(event: CustomEvent) {
    const { type, content, details, input, settings } = event.detail;
    db.cipherHistory.add({
      type,
      content,
      details,
      input: input || '',
      settings: settings || '{}',
      createdAt: new Date(),
      starred: 0
    });
    showToastMsg(dict.feedback.saved || 'Saved to secure history');
  }

  function handleCopy() {
    showToastMsg(dict.copied);
  }

  function handleRestore(event: CustomEvent) {
    const item = event.detail;
    // Switch tab based on type
    switch (item.type) {
      case 'hash':
      case 'hmac':
        activeTab = 'hash';
        // Use setTimeout to allow tab switch render before calling method
        setTimeout(() => hashComponent?.restore(item), 50);
        break;
      case 'encode':
        activeTab = 'encoders';
        // setTimeout(() => encoderComponent?.restore(item), 50); // Implement if EncoderDecoder supports restore
        break;
      case 'jwt':
        activeTab = 'jwt';
        // setTimeout(() => jwtComponent?.restore(item), 50); // Implement if JwtDebugger supports restore
        break;
      case 'password':
        activeTab = 'password';
        if (item.settings) {
            try {
                const settings = JSON.parse(item.settings);
                setTimeout(() => passwordComponent?.restore(settings), 50);
            } catch(e) { console.error('Failed to parse password settings', e)}
        }
        break;
    }
    showToastMsg('Restored from history');
  }

  function showToastMsg(msg: string) {
    toastMessage = msg;
    showToast = true;
    setTimeout(() => (showToast = false), 2000);
  }

  // Keyboard Shortcuts
  function handleKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      // Trigger "Generate" or "Calculate" depending on active tab
      // This is a bit tricky to target generically without knowing internal methods.
      // Ideally, pass a prop or call a method on the child component.
      // For now, we'll let the focused element handle it or implement specific logic if needed.
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<svelte:head>
  <title>{dict.title} - MicroTools</title>
  <meta name="description" content={dict.description} />
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Cipher Lab",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": "SHA Hashing, HMAC Calculation, Base64 Encoding, JWT Debugging, Password Generation, Entropy Visualizer"
    }
  </script>
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
             <Shield size={20} />
          </div>
          <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            {dict.title}
          </h1>
        </div>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Main Tool Area -->
      <div class="lg:col-span-8 space-y-6">

        <!-- Navigation Tabs -->
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-1.5 flex flex-wrap gap-1" role="tablist">
           <button
             role="tab"
             aria-selected={activeTab === 'hash'}
             class="flex-1 min-w-[100px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeTab === 'hash' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'}"
             on:click={() => activeTab = 'hash'}
           >
             <Hash size={16} />
             <span>{dict.tabs.hash}</span>
           </button>
           <button
             role="tab"
             aria-selected={activeTab === 'encoders'}
             class="flex-1 min-w-[100px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeTab === 'encoders' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'}"
             on:click={() => activeTab = 'encoders'}
           >
             <Code size={16} />
             <span>{dict.tabs.encoders}</span>
           </button>
           <button
             role="tab"
             aria-selected={activeTab === 'jwt'}
             class="flex-1 min-w-[100px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeTab === 'jwt' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'}"
             on:click={() => activeTab = 'jwt'}
           >
             <Key size={16} />
             <span>{dict.tabs.jwt}</span>
           </button>
           <button
             role="tab"
             aria-selected={activeTab === 'password'}
             class="flex-1 min-w-[100px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all {activeTab === 'password' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'}"
             on:click={() => activeTab = 'password'}
           >
             <Lock size={16} />
             <span>{dict.tabs.password}</span>
           </button>
        </div>

        <!-- Component Container -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 min-h-[400px]">
           {#if activeTab === 'hash'}
             <HashGenerator bind:this={hashComponent} {dict} on:save={handleSave} on:copy={handleCopy} />
           {:else if activeTab === 'encoders'}
             <EncoderDecoder bind:this={encoderComponent} {dict} on:save={handleSave} on:copy={handleCopy} />
           {:else if activeTab === 'jwt'}
             <JwtDebugger bind:this={jwtComponent} {dict} on:save={handleSave} on:copy={handleCopy} />
           {:else if activeTab === 'password'}
             <PasswordForge bind:this={passwordComponent} {dict} on:save={handleSave} on:copy={handleCopy} />
           {/if}
        </div>

        <!-- Guide & FAQ -->
        <div class="mt-12 space-y-8">
           <section class="prose dark:prose-invert max-w-none">
              <h2 class="text-2xl font-bold">{dict.guide.title}</h2>
              <p>{dict.guide.intro}</p>

              <h3 class="text-xl font-semibold">{dict.guide.featuresTitle}</h3>
              <ul class="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose">
                 <li class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    {@html dict.guide.f1.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-indigo-600 dark:text-indigo-400">$1</span>')}
                 </li>
                 <li class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    {@html dict.guide.f2.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-indigo-600 dark:text-indigo-400">$1</span>')}
                 </li>
                 <li class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    {@html dict.guide.f3.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-indigo-600 dark:text-indigo-400">$1</span>')}
                 </li>
              </ul>
           </section>

           <section>
             <h2 class="text-2xl font-bold mb-6 text-slate-900 dark:text-white">{dict.faqTitle}</h2>
             <div class="grid gap-4">
                <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                   <h3 class="font-semibold text-lg mb-2">{dict.q1}</h3>
                   <p class="text-slate-600 dark:text-slate-400 leading-relaxed">{dict.a1}</p>
                </div>
                <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                   <h3 class="font-semibold text-lg mb-2">{dict.q2}</h3>
                   <p class="text-slate-600 dark:text-slate-400 leading-relaxed">{dict.a2}</p>
                </div>
                <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                   <h3 class="font-semibold text-lg mb-2">{dict.q3}</h3>
                   <p class="text-slate-600 dark:text-slate-400 leading-relaxed">{dict.a3}</p>
                </div>
             </div>
           </section>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="lg:col-span-4 space-y-6">
         <!-- History -->
         <div class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 sticky top-24">
            <HistoryPanel {dict} on:copy={handleCopy} on:restore={handleRestore} />
         </div>

         <!-- Tips -->
         <div class="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <h3 class="text-lg font-bold mb-4 flex items-center space-x-2">
               <Star class="text-yellow-300" fill="currentColor" size={20} />
               <span>{dict.guide.tipsTitle}</span>
            </h3>
            <ul class="space-y-4 text-sm text-indigo-100">
               <li>{@html dict.guide.tip1.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')}</li>
               <li>{@html dict.guide.tip2.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')}</li>
               <li>{@html dict.guide.tip3.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')}</li>
            </ul>
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
</div>
