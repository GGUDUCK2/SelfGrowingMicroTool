<script lang="ts">
  import Head from '$lib/components/Head.svelte';
  import { page } from "$app/stores";
  import { getDictionary } from "$lib/dictionaries";
  import registry from "$lib/registry.json";
  import { fade, fly } from "svelte/transition";


  type Language = "en" | "ko";

  $: lang = ($page.params.lang || "en") as Language;
  $: dict = getDictionary(lang);
  $: tools = registry;

  let searchQuery = "";
  let selectedCategory = "all";

  $: categories = ["all", ...new Set(registry.map(t => t.category))].filter(Boolean).sort();

  $: filteredTools = tools.filter(tool => {
    const matchesSearch = tool.title[lang]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.description[lang]?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
</script>

<Head title="MicroFactory" description="MicroFactory Tools" />


<svelte:head>
  <title>{dict.home.title}</title>
  <meta name="description" content={dict.home.description} />
  <link rel="canonical" href="https://selfgrowingmicrotool.com/{lang}" />

  <!-- Open Graph -->
  <meta property="og:title" content={dict.home.title} />
  <meta property="og:description" content={dict.home.description} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://selfgrowingmicrotool.com/{lang}" />
  <meta property="og:site_name" content="MicroFactory" />

  <!-- JSON-LD -->
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html `<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://selfgrowingmicrotool.com/" + lang,
      "name": dict.home.title,
      "url": "https://selfgrowingmicrotool.com/" + lang,
      "description": dict.home.description
    })}</scr` + `ipt>`}
</svelte:head>

<div class="space-y-12">
  <section class="text-center py-20 space-y-6">
    <h1
      in:fly={{ y: 20, duration: 800 }}
      class="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white"
    >
      <span
        class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400"
      >
        {dict.home.title}
      </span>
    </h1>
    <p
      in:fly={{ y: 20, duration: 800, delay: 200 }}
      class="text-xl text-gray-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
    >
      {dict.home.description}
    </p>
  </section>

  <section class="max-w-4xl mx-auto space-y-6">
    <!-- Search Bar -->
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 dark:text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </div>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder={lang === 'ko' ? "도구 검색..." : "Search tools..."}
        class="w-full pl-11 pr-4 py-4 min-h-[44px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
      />
    </div>

    <!-- Category Filter -->
    <div class="flex flex-wrap gap-2 justify-center pb-8">
      {#each categories as category}
        <button
          on:click={() => selectedCategory = category}
          class="px-4 py-2 min-h-[44px] rounded-full text-sm font-medium transition-all capitalize
            {selectedCategory === category
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white'}"
        >
          {category}
        </button>
      {/each}
    </div>
  </section>

  {#if filteredTools.length === 0}
    <div class="text-center py-12">
      <p class="text-gray-500 dark:text-slate-400 text-lg">{lang === 'ko' ? "검색 결과가 없습니다." : "No tools found matching your criteria."}</p>
    </div>
  {/if}

  <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {#each filteredTools as tool, i (tool.id)}
      <a
        href="/{lang}/tools/{tool.slug}"
        in:fly={{ y: 20, duration: 800, delay: 400 + i * 100 }}
        class="group relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm hover:shadow-2xl dark:hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-slate-700 overflow-hidden"
      >
        <div
          class="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        ></div>

        <div class="relative z-10">
          <div
            class="mb-6 inline-flex p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300"
          >
            {#if tool.slug === "pomodoro-timer"}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-timer"
                ><line x1="10" x2="14" y1="2" y2="2" /><line
                  x1="12"
                  x2="15"
                  y1="14"
                  y2="11"
                /><circle cx="12" cy="14" r="8" /></svg
              >
            {:else if tool.slug === "compound-interest-calculator"}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-trending-up"
                ><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline
                  points="17 6 23 6 23 12"
                /></svg
              >
            {:else}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-wrench"
                ><path
                  d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
                /></svg
              >
            {/if}
          </div>

          <h2
            class="text-2xl font-bold text-gray-900 dark:text-white mb-3 ml-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
          >
            {tool.title[lang]}
          </h2>
          <p
            class="text-gray-500 dark:text-slate-400 leading-relaxed group-hover:text-gray-600 dark:group-hover:text-slate-300 transition-colors"
          >
            {tool.description[lang]}
          </p>
        </div>
      </a>
    {/each}
  </section>
</div>
