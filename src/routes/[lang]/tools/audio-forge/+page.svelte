<script lang="ts">
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import Workspace from '$lib/components/audio-forge/Workspace.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';

  $: lang = $page.params.lang || 'en';
  // Fallback if dictionary key doesn't exist yet (during development)
  $: dict = getDictionary(lang);
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

<svelte:head>
  <title>{toolDict.title} | MicroFactory</title>
  <meta name="description" content={toolDict.description} />
  <meta name="keywords" content="audio editor, waveform editor, sound recorder, tone generator, wav editor, online audio tool" />

  <meta property="og:title" content={toolDict.title} />
  <meta property="og:description" content={toolDict.description} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={$page.url.href} />

  {@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>

<div class="flex flex-col min-h-screen">
    <!-- Header -->
    <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 px-6 flex justify-between items-center">
        <div>
            <h1 class="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                {toolDict.title}
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
                {toolDict.description}
            </p>
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
