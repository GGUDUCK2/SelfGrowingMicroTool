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
    { q: (dict as any)?.q1, a: (dict as any)?.a1 },
    { q: (dict as any)?.q2, a: (dict as any)?.a2 },
    { q: (dict as any)?.q3, a: (dict as any)?.a3 },
  ];

  $: appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": $page.url.origin + "/" + lang + "/tools/pomodoro-timer",
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

    $: schemaList = [appSchema];

  $: howToSchema = {
    "@context": "https://schema.org",

    "@type": "HowTo",
    "name": "How to use Pomodoro Timer",
    "description": "Step-by-step guide to using the Pomodoro Timer tool.",
    "step": [
        {
            "@type": "HowToStep",
            "name": "Configure Tool",
            "text": "Adjust the settings or input your data according to your requirements."
        },
        {
            "@type": "HowToStep",
            "name": "Process Data",
            "text": "Review the live preview or click the generate/process button."
        },
        {
            "@type": "HowToStep",
            "name": "Export Result",
            "text": "Copy or download the final output."
        }
    ]

  };

</script>

<Head
  title={dict.title}
  description={dict.description}
/>

<svelte:head>
  <link rel="canonical" href={$page.url.origin + "/" + lang + "/tools/pomodoro-timer"} />
  <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/pomodoro-timer"} />
  <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/pomodoro-timer"} />
  <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/pomodoro-timer"} />
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(schemaList).replace(/</g, '\\u003c')}</scr` + `ipt>`}
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(howToSchema).replace(/</g, '\\u003c')}</scr` + `ipt>`}
</svelte:head>

<PomodoroTimer {dict} />

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
  <GuideSection {...dict.guide} />
  <AdPlaceholder />
  <FAQSection title={dict.faqTitle} items={faqItems} />
  <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="pomodoro-timer" currentCategory="dev" />
</div>
