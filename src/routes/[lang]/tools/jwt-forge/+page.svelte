<script lang="ts">
  import GuideSection from '$lib/components/GuideSection.svelte';
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import { db } from '$lib/db';
  import { parseJwt, verifySignature } from '$lib/utils/jwt-forge/parser';
  import type { JwtParts } from '$lib/utils/jwt-forge/types';
  import TokenEditor from '$lib/components/jwt-forge/TokenEditor.svelte';
  import DecodedVisualizer from '$lib/components/jwt-forge/DecodedVisualizer.svelte';
  import SignatureVerifier from '$lib/components/jwt-forge/SignatureVerifier.svelte';
  import HistoryPanel from '$lib/components/jwt-forge/HistoryPanel.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';

  $: lang = $page.params.lang || 'en';
  $: dictionary = getDictionary(lang);
  $: t = dictionary.jwtForge;

  let token = '';
  let secret = '';
  let parsed: JwtParts = {
    header: null,
    payload: null,
    signature: '',
    rawHeader: '',
    rawPayload: '',
    rawSignature: ''
  };
  let isVerified: boolean | null = null;
  let error = '';
  let saveTimer: ReturnType<typeof setTimeout>;

  $: if (token) {
    try {
      parsed = parseJwt(token);
      error = '';
      checkSignature();
    } catch (e) {
      error = t.error;
    }
  } else {
    parsed = { header: null, payload: null, signature: '', rawHeader: '', rawPayload: '', rawSignature: '' };
    isVerified = null;
    error = '';
  }

  $: if (secret && token) {
    checkSignature();
  }

  onDestroy(() => {
    clearTimeout(saveTimer);
  });

  async function checkSignature() {
    if (!token) return;
    // Don't verify if structure is obviously bad
    if (!parsed.header || !parsed.signature) {
        isVerified = null;
        return;
    }
    const result = await verifySignature(token, secret);
    isVerified = result.isValid;
  }

  function handleRestore(e: CustomEvent) {
    const item = e.detail;
    token = item.token;
    // We don't restore secret for security
  }

  function debouncedSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveToken, 2000);
  }

  async function saveToken() {
    if (!token || !parsed.header) return;

    // Check if exists
    const existing = await db.jwtForgeHistory.where('token').equals(token).first();
    if (existing) {
        await db.jwtForgeHistory.update(existing.id!, { createdAt: new Date() });
    } else {
        await db.jwtForgeHistory.add({
            token,
            header: parsed.header,
            payload: parsed.payload,
            algorithm: parsed.header.alg,
            isValid: isVerified || false,
            createdAt: new Date(),
            starred: 0
        });
    }
  }

  $: jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/jwt-forge",
        "isAccessibleForFree": true,
    "name": t.title,
    "description": t.description,
    "applicationCategory": "DeveloperTool",
    "applicationSubCategory": "Security Utility",
    "operatingSystem": ["Web", "iOS", "Android", "Windows", "macOS", "Linux"],
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
        "JWT Decoding",
        "Signature Verification",
        "Claim Inspection",
        "Secure Client-Side Processing"
    ]
  };

  $: jsonLd2 = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": t?.q1,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t?.a1
        }
      },
      {
        "@type": "Question",
        "name": t?.q2,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t?.a2
        }
      },
      {
        "@type": "Question",
        "name": t?.q3,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t?.a3
        }
      }
    ]
  };
</script>
<Head
  title={t.title}
  description={t.description}
/>


<svelte:head>

  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</scr` + `ipt>`}

  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html `<script type="application/ld+json">${JSON.stringify(jsonLd2)}</scr` + `ipt>`}

</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
  <!-- Header -->
  <div class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
        <div class="p-2 bg-pink-500 rounded-lg text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        {t.title}
      </h1>
      <p class="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl">
        {t.description}
      </p>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Left Column: Input -->
    <div class="space-y-6">
      <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <TokenEditor
          bind:token
          label={t.input}
          id="jwt-main-input"
          on:input={debouncedSave}
        />
        {#if error}
            <div class="mt-2 text-red-500 text-sm font-medium flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
            </div>
        {/if}
      </div>

      <SignatureVerifier
        bind:secret
        isValid={isVerified}
        dictionary={dictionary}
      />

      <HistoryPanel
        dictionary={dictionary}
        on:restore={handleRestore}
      />
    </div>

    <!-- Right Column: Output -->
    <div class="space-y-6">
      <DecodedVisualizer
        header={parsed.header}
        payload={parsed.payload}
        dictionary={dictionary}
      />
    </div>
  </div>

  <!-- Documentation -->
  <div class="max-w-4xl mx-auto px-4 mt-12">
    <article class="prose dark:prose-invert max-w-none min-h-[44px] min-w-[44px]">
       <h2 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500 mb-6">
        {t.guide.title}
      </h2>

      <p class="text-lg text-slate-600 dark:text-slate-400 mb-8">
        {t.guide.intro}
      </p>

      <div class="grid md:grid-cols-2 gap-8 mb-12">
        <div class="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 class="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">{t.guide.featuresTitle}</h3>
          <ul class="space-y-2 text-slate-600 dark:text-slate-400 list-disc pl-5">
            <li>{@html t.guide.f1}</li>
            <li>{@html t.guide.f2}</li>
            <li>{@html t.guide.f3}</li>
          </ul>
        </div>

        <div class="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
           <h3 class="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">{t.guide.tipsTitle}</h3>
           <ul class="space-y-2 text-slate-600 dark:text-slate-400 list-disc pl-5">
             <li>{@html t.guide.tip1}</li>
             <li>{@html t.guide.tip2}</li>
             <li>{@html t.guide.tip3}</li>
           </ul>
        </div>
      </div>
    </article>

    <div class="mt-12">
        <GuideSection {...t?.guide} />
  <AdPlaceholder />
  <FAQSection
            title={t.faqTitle}
            items={[
                { q: t?.q1, a: t?.a1 },
                { q: t?.q2, a: t?.a2 },
                { q: t?.q3, a: t?.a3 }
            ]}
        />
    </div>
  </div>
</div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <RelatedTools {lang} currentSlug="jwt-forge" currentCategory="dev" />
  </div>
