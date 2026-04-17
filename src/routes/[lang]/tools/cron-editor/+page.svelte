<script lang="ts">
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { page } from "$app/stores";
  import { onMount, onDestroy } from "svelte";
  import { slide } from "svelte/transition";
  import { browser } from "$app/environment";
  import CronVisualBuilder from "$lib/components/cron-editor/CronVisualBuilder.svelte";
  import CronPreview from "$lib/components/cron-editor/CronPreview.svelte";
  import CronHistory from "$lib/components/cron-editor/CronHistory.svelte";
  import CronActions from "$lib/components/cron-editor/CronActions.svelte";
  import {
    parseCronExpression,
    COMMON_PRESETS,
    COMMON_PRESETS_KO,
  } from "$lib/utils/cron";
  import FAQSection from "$lib/components/FAQSection.svelte";
  import { db } from "$lib/db";
  // import { getDictionary } from "$lib/dictionaries";

  $: lang = $page.params.lang || "en";

  // Local dictionary to fix SSR crash with getDictionary
  const dict = {
    title: "Cronos: Professional Cron Editor",
    description:
      "Build, debug, and translate Cron schedule expressions into human-readable text.",
    expression: "Cron Expression",
    clear: "Clear",
    presets: "Presets",
    shortcuts: { title: "Shortcuts", copy: "Copy", clear: "Clear" },
    loading: "Loading...",
    emptyHistory: "No history",
    historyTitle: "History",
    clearAll: "Clear All",
    settings: "Settings",
    save: "Save",
    restore: "Restore",
    delete: "Delete",
    buttons: { copy: "Copy", share: "Share", download: "Download" },
    feedback: { copied: "Copied!", downloadStarted: "Download Started" },
  };
  const commonDict = dict;

  let cronExpression = "* * * * *";
  let parseResult = parseCronExpression(cronExpression, lang);

  // Load from URL if present
  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cronParam = urlParams.get("cron");
    if (cronParam) {
      cronExpression = cronParam;
    }
  });

  $: {
    parseResult = parseCronExpression(cronExpression, lang);
    if (browser && parseResult.isValid) {
      debouncedSave(cronExpression, parseResult.description);
    }

    // Update URL
    if (browser) {
      const url = new URL(window.location.href);
      if (cronExpression !== "* * * * *") {
        url.searchParams.set("cron", cronExpression);
      } else {
        url.searchParams.delete("cron");
      }
      window.history.replaceState({}, "", url);
    }
  }

  let saveTimeout: ReturnType<typeof setTimeout>;
  function debouncedSave(expr: string, desc: string) {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      if (!expr || expr === "* * * * *") return;

      // Clean up old history (>100 items)
      const count = await db.cronHistory.count();
      if (count > 100) {
        const oldItems = await db.cronHistory
          .orderBy("createdAt")
          .limit(count - 100)
          .keys();
        await db.cronHistory.bulkDelete(oldItems);
      }

      // Check if last entry is same
      const last = await db.cronHistory.orderBy("createdAt").last();
      if (last && last.expression === expr) return;

      await db.cronHistory.add({
        expression: expr,
        description: desc,
        createdAt: new Date(),
      });
    }, 2000);
  }

  function handlePreset(preset: string) {
    cronExpression = preset;
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      navigator.clipboard.writeText(cronExpression);
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      cronExpression = "* * * * *";
    }
  }

  const faqs = [
    {
      question: { en: "What is Cron?", ko: "Cron이란 무엇인가요?" },
      answer: {
        en: "Cron is a time-based job scheduler in Unix-like computer operating systems.",
        ko: "Cron은 유닉스 계열 컴퓨터 운영 체제의 시간 기반 작업 스케줄러입니다.",
      },
    },
    {
      question: {
        en: "How do I use this tool?",
        ko: "이 도구는 어떻게 사용하나요?",
      },
      answer: {
        en: "Use the visual builder to select your schedule, or type directly into the input field.",
        ko: "비주얼 빌더를 사용하여 스케줄을 선택하거나 입력 필드에 직접 입력하세요.",
      },
    },
  ];

  $: faqItems = faqs.map(f => ({
    q: lang === 'ko' ? f.question.ko : f.question.en,
    a: lang === 'ko' ? f.answer.ko : f.answer.en
  }));

  $: jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
        "isAccessibleForFree": true,
      "name": "Cronos: Professional Cron Editor",
      "applicationCategory": "DeveloperApplication",
      "applicationSubCategory": "DevOps",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Visual Cron Builder",
        "Human-readable translation",
        "Next run time preview",
        "History & Favorites"
      ],
      "screenshot": "https://selfgrowingmicrotool.com/og/cron-editor.png",
      "author": {
        "@type": "Organization",
        "name": "MicroFactory"
      }
    };

  $: jsonLd2 = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://selfgrowingmicrotool.com/lang"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Tools",
          "item": "https://selfgrowingmicrotool.com/lang#tools"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Cronos",
          "item": "https://selfgrowingmicrotool.com/lang/tools/cron-editor"
        }
      ]
    };
</script>
<Head
  title={`${lang === "ko"
      ? `Cronos: 전문가용 Cron 에디터 - ${parseResult.isValid ? parseResult.description : "스케줄러"}`
      : `Cronos: Professional Cron Editor - ${parseResult.isValid ? parseResult.description : "Scheduler"}`}`}
  description={dict.description}
  keywords="cron, crontab, schedule, editor, generator, linux, devops"
/>


<svelte:window on:keydown={handleKeydown} />

<svelte:head>

  <!-- JSON-LD -->
  {@html '<script type="application/ld+json">' + JSON.stringify(jsonLd) + '</script>'}
  {@html '<script type="application/ld+json">' + JSON.stringify(jsonLd2) + '</script>'}
</svelte:head>

<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div
    class="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4"
  >
    <div>
      <h1
        class="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400"
      >
        {dict.title}
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        {dict.description}
      </p>
    </div>
    <div class="flex-shrink-0">
      <CronActions
        {cronExpression}
        description={parseResult.description}
        {lang}
        {dict}
      />
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Left Column: Editor -->
    <div class="lg:col-span-2 space-y-6">
      <!-- Input Area -->
      <div
        class="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm shadow-xl"
      >
        <label
          for="cron-input"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex justify-between"
        >
          <span>{dict.expression}</span>
          <span class="text-xs text-gray-500 font-normal">
            {lang === "ko"
              ? `단축키: Ctrl+K (${dict.shortcuts.clear})`
              : `Shortcut: Ctrl+K (${dict.shortcuts.clear})`}
          </span>
        </label>
        <div class="relative group">
          <input
            id="cron-input"
            type="text"
            bind:value={cronExpression}
            class="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-4 text-xl font-mono text-gray-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 min-h-[44px]"
            placeholder={lang === 'ko' ? "0 0 * * * (매일 자정)" : "0 0 * * * (Daily Midnight)"}
            aria-label="Cron 표현식 입력"
          />
          <div
            class="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <button
              class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
              on:click={() => (cronExpression = "* * * * *")}
              title={dict.clear}
            >
              ✕
            </button>
          </div>
        </div>

        {#if !parseResult.isValid}
          <div
            class="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm flex items-center"
            transition:slide
          >
            <span class="mr-2 text-lg">⚠️</span>
            {parseResult.error}
          </div>
        {/if}
      </div>

      <!-- Visual Builder -->
      <CronVisualBuilder {lang} bind:value={cronExpression} />

      <!-- Presets -->
      <div class="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {dict.presets}
        </h3>
        <div class="flex flex-wrap gap-2">
          {#each lang === "ko" ? COMMON_PRESETS_KO : COMMON_PRESETS as preset}
            <button
              class="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-full text-sm transition-colors border border-indigo-200 dark:border-indigo-500/20 min-h-[44px] min-w-[44px]"
              on:click={() => handlePreset(preset.value)}
            >
              {preset.name}
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- Right Column: Preview & History -->
    <div class="space-y-6">
      <CronPreview value={cronExpression} description={parseResult.description} />

      <CronHistory {lang} onSelect={(expr) => (cronExpression = expr)} {dict} />

      <!-- Keyboard Shortcuts Helper -->
      <div class="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 md:p-6">
        <h3
          class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider"
        >
          {dict.shortcuts.title}
        </h3>
        <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li class="flex justify-between">
            <span>{dict.shortcuts.copy}</span>
            <kbd class="bg-gray-100 dark:bg-black/40 px-2 py-0.5 rounded text-gray-500 dark:text-gray-300 font-mono"
              >Ctrl + S</kbd
            >
          </li>
          <li class="flex justify-between">
            <span>{dict.shortcuts.clear}</span>
            <kbd class="bg-gray-100 dark:bg-black/40 px-2 py-0.5 rounded text-gray-500 dark:text-gray-300 font-mono"
              >Ctrl + K</kbd
            >
          </li>
        </ul>
      </div>
    </div>
  </div>

  <div class="mt-12">
    <FAQSection title={lang === 'ko' ? '자주 묻는 질문' : 'Frequently Asked Questions'} items={faqItems} />
  </div>


  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-20">
    <RelatedTools {lang} currentSlug="cron-editor" currentCategory="dev" />
  </div>
</div>
