<script lang="ts">
  import Head from '$lib/components/Head.svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import Recorder from '$lib/components/screen-forge/Recorder.svelte';
  import Preview from '$lib/components/screen-forge/Preview.svelte';
  import History from '$lib/components/screen-forge/History.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import { Monitor } from 'lucide-svelte';

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang);
  $: t = dict?.tools?.screenForge;

  let currentBlob: Blob | null = null;
  let view: 'record' | 'preview' = 'record';

  function handleRecordingComplete(blob: Blob) {
      currentBlob = blob;
      view = 'preview';
  }

  function handleDiscard() {
      currentBlob = null;
      view = 'record';
  }

  function handlePlayFromHistory(blob: Blob) {
      currentBlob = blob;
      view = 'preview';
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  $: jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "isAccessibleForFree": true,
        "name": t?.title,
        "description": t?.description,
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
           (t?.guide?.f1 || "").replace(/\*\*(.*?)\*\*/g, '$1'),
           (t?.guide?.f2 || "").replace(/\*\*(.*?)\*\*/g, '$1'),
           (t?.guide?.f3 || "").replace(/\*\*(.*?)\*\*/g, '$1')
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": t?.q1,
            "acceptedAnswer": { "@type": "Answer", "text": t?.a1 }
          },
          {
            "@type": "Question",
            "name": t?.q2,
            "acceptedAnswer": { "@type": "Answer", "text": t?.a2 }
          },
          {
            "@type": "Question",
            "name": t?.q3,
            "acceptedAnswer": { "@type": "Answer", "text": t?.a3 }
          }
        ]
      }
    ]
  };
</script>
<Head
  title={t?.title}
  description={t?.description}
  keywords="screen recorder, screen capture, video recorder, webm recorder, browser screen recording, no watermark"
/>


<svelte:head>



  {@html '<script type="application/ld+json">' + JSON.stringify(jsonLd) + '</script>'}
</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white pb-20">
  <!-- Header -->
  <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center space-x-3">
        <a href="/{lang}" aria-label="Back to home" class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </a>
        <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
             <Monitor size={20} />
        </div>
        <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            {t?.title}
        </h1>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

      <!-- Workspace -->
      <section class="min-h-[600px]">
          {#if view === 'record'}
              <Recorder {t} onRecordingComplete={handleRecordingComplete} />
          {:else if view === 'preview' && currentBlob}
              <Preview {t} blob={currentBlob} onDiscard={handleDiscard} />
          {/if}
      </section>

      <!-- History -->
      <section class="border-t border-slate-200 dark:border-slate-800 pt-12">
          <History {t} onPlay={handlePlayFromHistory} />
      </section>

      <!-- Guide & FAQ -->
      <section class="grid md:grid-cols-2 gap-12 border-t border-slate-200 dark:border-slate-800 pt-12">
           <GuideSection
               title={t?.guide?.title}
               intro={t?.guide?.intro}
               featuresTitle={t?.guide?.featuresTitle}
               f1={t?.guide?.f1}
               f2={t?.guide?.f2}
               f3={t?.guide?.f3}
               tipsTitle={t?.guide?.tipsTitle}
               tip1={t?.guide?.tip1}
               tip2={t?.guide?.tip2}
               tip3={t?.guide?.tip3}
           />

           <FAQSection
               title={t?.faqTitle}
               items={[
                   { q: t?.q1, a: t?.a1 },
                   { q: t?.q2, a: t?.a2 },
                   { q: t?.q3, a: t?.a3 }
               ]}
           />
      </section>
  </main>
</div>
