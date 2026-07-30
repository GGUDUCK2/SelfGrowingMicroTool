<script lang="ts">
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { onMount } from "svelte";
  import { fade, fly, slide } from "svelte/transition";
  import { dictionaries } from "$lib/dictionaries";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { debounce } from "$lib/utils";
  import FAQSection from "$lib/components/FAQSection.svelte";
  import GuideSection from "$lib/components/GuideSection.svelte";
  import { db, type GlassmorphismHistory } from "$lib/db";
  import { liveQuery } from "dexie";

    $: lang = (($page.params.lang || "en") as "en" | "ko") || "en";
  $: dict =
    dictionaries[lang]?.tools?.glassmorphism ||
    dictionaries.en.tools.glassmorphism;

  // State
  let blur = 16;
  let transparency = 0.6;
  let color = "#ffffff";
  let outline = 1;
  let radius = 16;
  let isLoaded = false;
  let copied = false;
  let linkCopied = false;

  // Load data from URL
  onMount(() => {
    const params = $page.url.searchParams;
    if (params.has("blur")) blur = Number(params.get("blur"));
    if (params.has("transparency"))
      transparency = Number(params.get("transparency"));
    if (params.has("color")) color = params.get("color") || "#ffffff";
    if (params.has("outline")) outline = Number(params.get("outline"));
    if (params.has("radius")) radius = Number(params.get("radius"));
    isLoaded = true;
  });

  // Sync state to URL (Debounced)
  const syncState = debounce(async () => {
    if (!isLoaded) return;
    const url = new URL($page.url);
    url.searchParams.set("blur", String(blur));
    url.searchParams.set("transparency", String(transparency));
    url.searchParams.set("color", color);
    url.searchParams.set("outline", String(outline));
    url.searchParams.set("radius", String(radius));

    await goto(url, { replaceState: true, noScroll: true, keepFocus: true });
  }, 500);

  $: {
    if (isLoaded) {
      // Trigger sync when any value changes
      blur;
      transparency;
      color;
      outline;
      radius;
      syncState();
    }
  }

  // Derived CSS
  $: rgbaColor = hexToRgba(color, transparency);
  $: cssCode = `background: ${rgbaColor};
backdrop-filter: blur(${blur}px);
-webkit-backdrop-filter: blur(${blur}px);
border-radius: ${radius}px;
border: ${outline}px solid rgba(255, 255, 255, 0.3);
box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);`;

  function hexToRgba(hex: string, alpha: number) {
    let r = 0,
      g = 0,
      b = 0;
    if (hex.length === 4) {
      r = parseInt("0x" + hex[1] + hex[1]);
      g = parseInt("0x" + hex[2] + hex[2]);
      b = parseInt("0x" + hex[3] + hex[3]);
    } else if (hex.length === 7) {
      r = parseInt("0x" + hex[1] + hex[2]);
      g = parseInt("0x" + hex[3] + hex[4]);
      b = parseInt("0x" + hex[5] + hex[6]);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(cssCode);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      linkCopied = true;
      setTimeout(() => (linkCopied = false), 2000);
    } catch (err) {
      console.error("Failed to copy link!", err);
    }
  }

  // History
  let history = liveQuery(() =>
    db.glassmorphismHistory.orderBy("createdAt").reverse().toArray()
  );

  async function saveToHistory() {
    await db.glassmorphismHistory.add({
      blur,
      transparency,
      color,
      outline,
      radius,
      createdAt: new Date()});
  }

  function restoreHistory(item: GlassmorphismHistory) {
    blur = item.blur;
    transparency = item.transparency;
    color = item.color;
    outline = item.outline;
    radius = item.radius;
  }

  async function deleteHistory(id: number) {
    await db.glassmorphismHistory.delete(id);
  }

  async function clearHistory() {
    await db.glassmorphismHistory.clear();
  }

  // FAQ Data
  $: faqItems = [
    { q: (dict as any)?.q1, a: (dict as any)?.a1 },
    { q: (dict as any)?.q2, a: (dict as any)?.a2 },
    { q: (dict as any)?.q3, a: (dict as any)?.a3 },
  ];

  // Breadcrumb Names
  $: homeName = lang === "ko" ? "홈" : "Home";
  $: toolsName = lang === "ko" ? "도구" : "Tools";

  $: schemaObj1 = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
        "@id": $page.url.origin + "/" + lang + "/tools/glassmorphism-generator",
        "isAccessibleForFree": true,
    "name": dict.title,
    "description": dict.description,
    "applicationCategory": "DesignApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }};
  $: schemaObj2 = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{
      "@type": "ListItem",
      "position": 1,
      "name": homeName,
      "item": "https://selfgrowingmicrotool.com/"
    }, {
      "@type": "ListItem",
      "position": 2,
      "name": toolsName,
      "item": "https://selfgrowingmicrotool.com/tools"
    }, {
      "@type": "ListItem",
      "position": 3,
      "name": dict.title,
      "item": `${$page.url.origin}/${lang}/tools/glassmorphism-generator`
    }]
  };

  $: schemaObj3 = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };
</script>
<Head
  title={dict.title}
  description={dict.description}
/>


<svelte:head>
  <link rel="canonical" href={$page.url.origin + "/" + lang + "/tools/glassmorphism-generator"} />
  <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/glassmorphism-generator"} />
  <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/glassmorphism-generator"} />
  <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/glassmorphism-generator"} />
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(schemaObj1)}</scr` + `ipt>`}
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(schemaObj2)}</scr` + `ipt>`}
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(schemaObj3)}</scr` + `ipt>`}
</svelte:head>

<div class="max-w-6xl mx-auto py-12 space-y-12 px-4">
  <div class="text-center space-y-4">
    <h1 class="text-4xl font-bold text-gray-900">
      {dict.title}
    </h1>
    <p class="text-gray-500 max-w-2xl mx-auto">
      {dict.description}
    </p>
    <div class="flex justify-center">
        <button
          on:click={copyLink}
          class="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors touch-manipulation min-h-[44px] min-w-[44px]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-share-2"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
            <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
          </svg>
          {#if linkCopied}
            {dict.linkCopied}
          {:else}
            {dict.shareLink}
          {/if}
        </button>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Controls -->
    <div
      class="lg:col-span-1 bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 self-start sticky top-6 space-y-6"
    >
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-sliders-horizontal text-indigo-600"
            >
            <line x1="21" x2="14" y1="4" y2="4" />
            <line x1="10" x2="3" y1="4" y2="4" />
            <line x1="21" x2="12" y1="12" y2="12" />
            <line x1="8" x2="3" y1="12" y2="12" />
            <line x1="21" x2="16" y1="20" y2="20" />
            <line x1="12" x2="3" y1="20" y2="20" />
            <line x1="14" y1="2" y2="6" />
            <line x1="8" y1="10" y2="14" />
            <line x1="16" y1="18" y2="22" />
            </svg>
            {dict.config}
        </h2>
        <button
            on:click={saveToHistory}
            class="text-sm bg-indigo-50 px-3 py-1.5 rounded-lg text-indigo-600 hover:text-indigo-800 font-medium touch-manipulation transition-colors min-h-[44px] min-w-[44px]"
        >
            {dict.save}
        </button>
      </div>

      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {dict.blur} ({blur}px)
            <input
              type="range"
              min="0"
              max="40"
              step="1"
              bind:value={blur}
              aria-label={dict.blur}
              class="w-full mt-2 accent-indigo-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer touch-manipulation min-h-[44px]"
            />
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {dict.transparency} ({Math.round(transparency * 100)}%)
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              bind:value={transparency}
              aria-label={dict.transparency}
              class="w-full mt-2 accent-indigo-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer touch-manipulation min-h-[44px]"
            />
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {dict.color}
            <div class="flex gap-2 mt-2">
              <input
                type="color"
                bind:value={color}
                aria-label="{dict.color} picker"
                class="h-10 w-12 p-0 border-0 rounded cursor-pointer touch-manipulation min-h-[44px] min-w-[44px]"
              />
              <input
                type="text"
                bind:value={color}
                aria-label="{dict.color} hex code"
                class="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none uppercase min-h-[44px] min-w-[44px]"
              />
            </div>
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {dict.outline} ({outline}px)
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              bind:value={outline}
              aria-label={dict.outline}
              class="w-full mt-2 accent-indigo-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer touch-manipulation min-h-[44px]"
            />
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {dict.radius} ({radius}px)
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              bind:value={radius}
              aria-label={dict.radius}
              class="w-full mt-2 accent-indigo-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer touch-manipulation min-h-[44px]"
            />
          </label>
        </div>
      </div>
    </div>

    <!-- Preview & Code -->
    <div class="lg:col-span-2 space-y-8">
      <!-- Preview Area -->
      <div
        class="relative w-full h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner border border-gray-200"
        role="img"
        aria-label="Glassmorphism preview area"
      >
        <!-- Colorful Background -->
        <div
          class="absolute inset-0 z-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
        >
          <!-- Abstract shapes -->
          <div
            class="absolute top-10 left-10 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"
          ></div>
          <div
            class="absolute top-10 right-10 w-32 h-32 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
          ></div>
          <div
            class="absolute -bottom-8 left-20 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"
          ></div>
        </div>

        <!-- Glass Card -->
        <div
          class="z-10 w-64 h-40 flex items-center justify-center text-white/90 font-medium"
          style={cssCode}
        >
          <span class="drop-shadow-md text-lg">{dict.preview}</span>
        </div>
      </div>

      <!-- CSS Code Output -->
      <div class="bg-slate-900 rounded-2xl p-6 shadow-lg relative group">
        <h3 class="text-slate-400 text-xs font-semibold uppercase mb-4">
          {dict.cssCode}
        </h3>
        <pre
          class="text-green-400 font-mono text-sm overflow-x-auto whitespace-pre-wrap">{cssCode}</pre>

        <button
          on:click={copyToClipboard}
          class="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 sm:px-3 sm:py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 backdrop-blur-sm touch-manipulation min-h-[44px] min-w-[44px]"
        >
          {#if copied}
            <span in:fly={{ y: 5 }} class="text-green-400">{dict.copied}</span>
          {:else}
            <span in:fade>{dict.copy}</span>
          {/if}
        </button>
      </div>

      <!-- History Section -->
      {#if $history && $history.length > 0}
        <div class="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-history text-indigo-600"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"/><path d="M3 3v9h9"/><path d="M12 7v5l4 2"/></svg>
                    {dict.history}
                </h3>
                <button
                    on:click={clearHistory}
                    class="text-sm text-red-500 hover:text-red-700 font-medium touch-manipulation min-h-[44px] min-w-[44px]"
                >
                    {dict.clearHistory}
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each $history as item (item.id)}
                    <div class="group relative bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all touch-manipulation">
                        <button class="w-full text-left min-h-[44px] min-w-[44px]" on:click={() => restoreHistory(item)}>
                            <div class="flex items-center gap-2 mb-2">
                                <div class="w-4 h-4 rounded-full border border-gray-300" style="background: {item.color}; opacity: {item.transparency}"></div>
                                <span class="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</span>
                            </div>
                            <div class="space-y-1 text-xs text-gray-600">
                                <div class="flex justify-between">
                                    <span>{dict.blur}:</span>
                                    <span class="font-medium">{item.blur}px</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>{dict.transparency}:</span>
                                    <span class="font-medium">{Math.round(item.transparency * 100)}%</span>
                                </div>
                            </div>
                        </button>
                         <button
                            on:click|stopPropagation={() => item.id && deleteHistory(item.id)}
                            class="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                            aria-label={dict.delete}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </button>
                    </div>
                {/each}
            </div>
        </div>
      {/if}

       <!-- Guide Section -->
       {#if dict.guide}
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
       {/if}

      <!-- FAQ Section -->
      <AdPlaceholder />
  <FAQSection title={dict.faqTitle} items={faqItems} />
    </div>
  </div>
</div>

<style>
  .animate-blob {
    animation: blob 7s infinite;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
  @keyframes blob {
    0% {
      transform: translate(0px, 0px) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
    100% {
      transform: translate(0px, 0px) scale(1);
    }
  }
</style>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="glassmorphism-generator" currentCategory="dev" />
  </div>
