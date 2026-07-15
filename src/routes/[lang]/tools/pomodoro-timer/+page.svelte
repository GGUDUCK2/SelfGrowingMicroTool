<script lang="ts">
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import { page } from '$app/stores';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { dictionaries } from "$lib/dictionaries";
  import FAQSection from "$lib/components/FAQSection.svelte";
  import GuideSection from "$lib/components/GuideSection.svelte";
  import PomodoroTimer from "$lib/components/pomodoro-timer/PomodoroTimer.svelte";

  type Language = "en" | "ko";
  $: lang = ($page.params.lang || "en") as Language;
  $: dict = (dictionaries as any)[lang]?.tools?.pomodoroTimer || dictionaries.en.tools.pomodoroTimer;

  $: faqItems = [
    { q: dict?.q1, a: dict?.a1 },
    { q: dict?.q2, a: dict?.a2 },
    { q: dict?.q3, a: dict?.a3 },
  ];

  $: appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/pomodoro-timer",
    "isAccessibleForFree": true,
    "name": dict.title,
    "description": dict.description,
    "applicationCategory": "ProductivityApplication",
    "applicationSubCategory": "Time Management",
    "operatingSystem": "Web, iOS, Android, macOS, Windows, Linux",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "keywords": "Pomodoro Timer, Focus Timer, Productivity Tool, Time Management",
    "featureList": "Customizable Timer Intervals, Focus Mode, Audio Notifications, Responsive Design"
  };

  $: breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://selfgrowingmicrotool.com/"
    }, {
      "@type": "ListItem",
      "position": 2,
      "name": "Tools",
      "item": "https://selfgrowingmicrotool.com/tools"
    }, {
      "@type": "ListItem",
      "position": 3,
      "name": dict.title,
      "item": `https://selfgrowingmicrotool.com/${lang}/tools/pomodoro-timer`
    }]
  };

  $: schemaList = [appSchema, breadcrumbSchema];
</script>

<Head
  title={dict.title}
  description={dict.description}
/>

<svelte:head>
  <link rel="canonical" href={"https://selfgrowingmicrotool.com/" + lang + "/tools/pomodoro-timer"} />
  <link rel="alternate" hreflang="en" href="https://selfgrowingmicrotool.com/en/tools/pomodoro-timer" />
  <link rel="alternate" hreflang="ko" href="https://selfgrowingmicrotool.com/ko/tools/pomodoro-timer" />
  <link rel="alternate" hreflang="x-default" href="https://selfgrowingmicrotool.com/en/tools/pomodoro-timer" />
  {@html `<script type="application/ld+json">${JSON.stringify(schemaList)}</scr` + `ipt>`}
</svelte:head>

<PomodoroTimer {dict} />

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
  <GuideSection {...dict.guide} />
  <AdPlaceholder />
  <FAQSection title={dict.faqTitle} items={faqItems} />
  <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="pomodoro-timer" currentCategory="productivity" />
</div>
