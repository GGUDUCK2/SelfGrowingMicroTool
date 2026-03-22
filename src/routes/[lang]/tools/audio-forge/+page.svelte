<script lang="ts">
  import Head from '$lib/components/Head.svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import Workspace from '$lib/components/audio-forge/Workspace.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import { ChevronLeft, Headphones } from 'lucide-svelte';

  $: lang = $page.params.lang || 'en';
  // Fallback if dictionary key doesn't exist yet (during development)
  $: dict = getDictionary(lang);
  $: common = dict.common || { back: "Back", home: "Home" };
  $: toolDict = dict.tools.audioForge || {
      title: "Audio Forge",
      description: "Professional Audio Editor",
      guide: {},
      q1: "", a1: "", q2: "", a2: "", q3: "", a3: ""
  };

  $: jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": toolDict.title,
        "description": toolDict.description,
        "applicationCategory": "MultimediaApplication",
        "applicationSubCategory": "Audio Editor",
        "operatingSystem": "Any",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
          "Audio Recording",
          "Waveform Editing",
          "Tone Generation",
          "WAV Export",
          "Offline Processing"
        ]
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://selfgrowingmicrotool.com/" + lang
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Tools",
            "item": "https://selfgrowingmicrotool.com/" + lang + "#tools"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": toolDict.title,
            "item": "https://selfgrowingmicrotool.com/" + lang + "/tools/audio-forge"
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": toolDict.q1,
            "acceptedAnswer": { "@type": "Answer", "text": toolDict.a1 }
          },
          {
            "@type": "Question",
            "name": toolDict.q2,
            "acceptedAnswer": { "@type": "Answer", "text": toolDict.a2 }
          },
          {
            "@type": "Question",
            "name": toolDict.q3,
            "acceptedAnswer": { "@type": "Answer", "text": toolDict.a3 }
          }
        ]
      }
    ]
  });
</script>
<Head
  title={toolDict.title}
  description={toolDict.description}
  keywords="audio editor, waveform editor, sound recorder, tone generator, wav editor, online audio tool"
/>


<svelte:head>


  {@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>

<div class="flex flex-col min-h-screen">
    <!-- Header -->
    <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between w-full">
            <div class="flex items-center space-x-3">
                <a href="/{lang}" aria-label={common.back} class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center p-2 -ml-2 rounded-lg">
                    <ChevronLeft size={20} />
                </a>
                <div class="flex items-center space-x-2">
                    <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <Headphones size={20} />
                    </div>
                    <div>
                        <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                            {toolDict.title}
                        </h1>
                    </div>
                </div>
            </div>
            <div class="hidden sm:block">
                <p class="text-sm text-slate-500 dark:text-slate-400">
                    {toolDict.description}
                </p>
            </div>
        </div>
    </header>

    <!-- App Area -->
    <main class="flex-1 h-[600px] min-h-[500px]">
        <Workspace dict={toolDict} />
    </main>

    <!-- Documentation -->
    <div class="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div class="max-w-5xl mx-auto px-4 py-12">
            {#if toolDict.guide.title}
                <GuideSection
                    title={toolDict.guide.title}
                    intro={toolDict.guide.intro}
                    featuresTitle={toolDict.guide.featuresTitle}
                    tipsTitle={toolDict.guide.tipsTitle}
                    f1={toolDict.guide.f1}
                    f2={toolDict.guide.f2}
                    f3={toolDict.guide.f3}
                    tip1={toolDict.guide.tip1}
                    tip2={toolDict.guide.tip2}
                    tip3={toolDict.guide.tip3}
                />
            {/if}

            <div class="mt-12">
                <FAQSection
                    title={toolDict.faqTitle}
                    items={[
                        { q: toolDict.q1, a: toolDict.a1 },
                        { q: toolDict.q2, a: toolDict.a2 },
                        { q: toolDict.q3, a: toolDict.a3 }
                    ]}
                />
            </div>
        </div>
    </div>
</div>
