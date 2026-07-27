<script lang="ts">
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import Head from '$lib/components/Head.svelte';
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';
  import { fade, slide } from 'svelte/transition';
  import { db } from '$lib/db';
  import { cipherWorkspace } from '$lib/db/workspace';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import HashGenerator from '$lib/components/cipher-lab/HashGenerator.svelte';
  import EncoderDecoder from '$lib/components/cipher-lab/EncoderDecoder.svelte';
  import JwtDebugger from '$lib/components/cipher-lab/JwtDebugger.svelte';
  import PasswordForge from '$lib/components/cipher-lab/PasswordForge.svelte';
  import KeyGenerator from '$lib/components/cipher-lab/KeyGenerator.svelte';
  import SecureVault from '$lib/components/cipher-lab/SecureVault.svelte';
  import HistoryPanel from '$lib/components/cipher-lab/HistoryPanel.svelte';
  import { Shield, Hash, Code, Key, Lock, Check, Star, KeyRound, Vault } from '@lucide/svelte';
  import { onMount, onDestroy } from 'svelte';

  $: lang = $page.params.lang || 'en';
  $: dict = ((getDictionary(lang) as any)?.tools?.cipherLab || {}) as any;
  $: common = getDictionary(lang).common;

  $: breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": `https://selfgrowingmicrotool.com/${lang}`
    },{
      "@type": "ListItem",
      "position": 2,
      "name": "Tools",
      "item": `https://selfgrowingmicrotool.com/${lang}#tools`
    },{
      "@type": "ListItem",
      "position": 3,
      "name": dict.title,
      "item": `https://selfgrowingmicrotool.com/${lang}/tools/cipher-lab`
    }]
  };

  $: softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/cipher-lab",
        "isAccessibleForFree": true,
    "name": dict.title,
    "description": dict.description,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [dict.guide.f1, dict.guide.f2, dict.guide.f3].map(f => f.replace(/\*\*/g, '')).join(", ")
  };

  $: faqItems = [
    { q: (dict as any)?.q1, a: (dict as any)?.a1 },
    { q: (dict as any)?.q2, a: (dict as any)?.a2 },
    { q: (dict as any)?.q3, a: (dict as any)?.a3 }
  ];



  let activeTab: 'hash' | 'encoders' | 'jwt' | 'password' | 'keygen' | 'vault' = 'hash';
  let showToast = false;
  let toastMessage = '';

  // Component References
  let hashComponent: HashGenerator;
  let encoderComponent: EncoderDecoder;
  let jwtComponent: JwtDebugger;
  let passwordComponent: PasswordForge;
  let keygenComponent: KeyGenerator;
  let vaultComponent: SecureVault;

  async function handleSave(event: CustomEvent) {
    const { type, content, details, input, settings } = event.detail;
    await cipherWorkspace.save({
      type,
      content,
      details,
      input: input || '',
      settings: settings || '{}'
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
    // Ctrl+K to clear
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
       // Handled by individual components
    }
  }
</script>
<Head
  title={dict.title}
  description={dict.description}
  keywords="hash generator, hmac calculator, jwt debugger, password generator, aes encryption, web crypto api, sha-256, sha-512, md5, base64 encoder"
/>


<svelte:window on:keydown={handleKeydown} />

<svelte:head>

  <link rel="canonical" href={"https://selfgrowingmicrotool.com/" + lang + "/tools/cipher-lab"} />
  <link rel="alternate" hreflang="en" href="https://selfgrowingmicrotool.com/en/tools/cipher-lab" />
  <link rel="alternate" hreflang="ko" href="https://selfgrowingmicrotool.com/ko/tools/cipher-lab" />
  <link rel="alternate" hreflang="x-default" href="https://selfgrowingmicrotool.com/en/tools/cipher-lab" />
  <!-- Twitter -->

    <link rel="alternate" hreflang="en" href="https://selfgrowingmicrotool.com/en/tools/cipher-lab" />
  <link rel="alternate" hreflang="ko" href="https://selfgrowingmicrotool.com/ko/tools/cipher-lab" />
  <link rel="alternate" hreflang="x-default" href="https://selfgrowingmicrotool.com/en/tools/cipher-lab" />
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</scr` + `ipt>`}
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(softwareSchema)}</scr` + `ipt>`}


</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white pb-20">
  <!-- Header -->
  <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <a href="/{lang}" aria-label={common.back} class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
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

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Main Tool Area -->
      <div class="lg:col-span-8 space-y-6">

        <!-- Navigation Tabs -->
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-1.5 flex overflow-x-auto gap-1" role="tablist">
           <button
             role="tab"
             aria-selected={activeTab === 'hash'}
             class="flex-1 min-w-[100px] min-h-[44px] min-w-[44px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all {activeTab === 'hash' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'}"
             on:click={() => activeTab = 'hash'}
           >
             <Hash size={16} />
             <span>{dict.tabs.hash}</span>
           </button>
           <button
             role="tab"
             aria-selected={activeTab === 'encoders'}
             class="flex-1 min-w-[100px] min-h-[44px] min-w-[44px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all {activeTab === 'encoders' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'}"
             on:click={() => activeTab = 'encoders'}
           >
             <Code size={16} />
             <span>{dict.tabs.encoders}</span>
           </button>
           <button
             role="tab"
             aria-selected={activeTab === 'jwt'}
             class="flex-1 min-w-[100px] min-h-[44px] min-w-[44px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all {activeTab === 'jwt' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'}"
             on:click={() => activeTab = 'jwt'}
           >
             <Key size={16} />
             <span>{dict.tabs.jwt}</span>
           </button>
           <button
             role="tab"
             aria-selected={activeTab === 'password'}
             class="flex-1 min-w-[100px] min-h-[44px] min-w-[44px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all {activeTab === 'password' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'}"
             on:click={() => activeTab = 'password'}
           >
             <Lock size={16} />
             <span>{dict.tabs.password}</span>
           </button>
           <button
             role="tab"
             aria-selected={activeTab === 'keygen'}
             class="flex-1 min-w-[100px] min-h-[44px] min-w-[44px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all {activeTab === 'keygen' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'}"
             on:click={() => activeTab = 'keygen'}
           >
             <KeyRound size={16} />
             <span>{dict.tabs.keygen}</span>
           </button>
           <button
             role="tab"
             aria-selected={activeTab === 'vault'}
             class="flex-1 min-w-[100px] min-h-[44px] min-w-[44px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all {activeTab === 'vault' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'}"
             on:click={() => activeTab = 'vault'}
           >
             <Vault size={16} />
             <span>{dict.tabs.vault}</span>
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
           {:else if activeTab === 'keygen'}
             <KeyGenerator bind:this={keygenComponent} {dict} on:save={handleSave} on:copy={handleCopy} />
           {:else if activeTab === 'vault'}
             <SecureVault bind:this={vaultComponent} {dict} on:save={handleSave} on:copy={handleCopy} />
           {/if}
        </div>

        <!-- Guide & FAQ -->
        <div class="mt-12 space-y-8">
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

           <AdPlaceholder />
  <FAQSection title={dict.faqTitle} items={faqItems} />
        </div>
      </div>

      <!-- Sidebar -->
      <div class="lg:col-span-4 space-y-6">
         <!-- History -->
         <div class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 sticky top-24">
            <HistoryPanel {dict} on:copy={handleCopy} on:restore={handleRestore} />
         </div>

      </div>
    </div>

    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="cipher-lab" currentCategory="security" />
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
