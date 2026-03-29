<script lang="ts">
  import Head from '$lib/components/Head.svelte';
  import Workspace from '$lib/components/banner-forge/Workspace.svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import FAQSection from '$lib/components/FAQSection.svelte';

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang);
  $: toolDict = dict.tools.bannerForge;

  $: title = toolDict.title;
  $: description = toolDict.description;
  $: canonical = `https://selfgrowingmicrotool.com/${lang}/tools/banner-forge`;

  $: jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "Banner Forge",
        "description": description,
        "applicationCategory": "DesignApplication",
        "operatingSystem": "Web Browser",
        "applicationSubCategory": "Graphic Design",
        "author": {
            "@type": "Organization",
            "name": "MicroTools Factory"
        },
        "softwareRequirements": "Modern Web Browser (Chrome, Firefox, Safari, Edge)",
        "screenshot": "https://selfgrowingmicrotool.com/assets/screenshots/banner-forge.png",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
           "Open Graph Image Generator",
           "Social Media Banner Creator",
           "Client-side Processing",
           "Drag and Drop Interface",
           "Social media presets",
           "Custom text layers",
           "Background patterns and gradients"
        ]
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [{
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": `https://selfgrowingmicrotool.com/${lang}`
        }, {
          "@type": "ListItem",
          "position": 2,
          "name": "Tools",
          "item": `https://selfgrowingmicrotool.com/${lang}/tools`
        }, {
          "@type": "ListItem",
          "position": 3,
          "name": toolDict.title,
          "item": canonical
        }]
      }
    ]
  };
</script>
<Head
  title={title}
  description={description}
  keywords="og image generator, social media banner, youtube thumbnail maker, twitch banner, linkedin header, design tool, open graph maker"
/>


<svelte:head>




  {@html '<script type="application/ld+json">' + JSON.stringify(jsonLd) + '</script>'}

  {@html `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "${dict.q1}",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "${dict.a1}"
        }
      },
      {
        "@type": "Question",
        "name": "${dict.q2}",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "${dict.a2}"
        }
      },
      {
        "@type": "Question",
        "name": "${dict.q3}",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "${dict.a3}"
        }
      }
    ]
  }
  </script>`}

</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-slate-900">
    <Workspace dict={toolDict} />

    <!-- Guide & FAQ -->
    <div class="max-w-5xl mx-auto px-4 py-16 space-y-16">
        <section class="prose dark:prose-invert max-w-none">
            <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-6">{toolDict.guide.title}</h2>
            <p class="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                {toolDict.guide.intro}
            </p>

            <div class="grid md:grid-cols-3 gap-8 mt-12 not-prose">
                <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div class="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
                    </div>
                    <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Smart Presets</h3>
                    <p class="text-sm text-slate-600 dark:text-slate-400">
                        One-click resize for Facebook, Twitter, Instagram, and LinkedIn.
                    </p>
                </div>
                <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div class="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                    </div>
                    <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Local Privacy</h3>
                    <p class="text-sm text-slate-600 dark:text-slate-400">
                        Your images and designs are processed entirely in your browser.
                    </p>
                </div>
                <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div class="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.81 0l-5.1 2.73a1.93 1.93 0 0 0-.91 1.68V19a1.93 1.93 0 0 0 .91 1.69l5.1 2.72a1.93 1.93 0 0 0 1.81 0l12.35-6.61a1.93 1.93 0 0 0 .91-1.69V10.53a1.93 1.93 0 0 0-.91-1.69z"/><path d="m12 5.25 4.96 2.65"/><path d="m5.6 9.23 6.4 3.42 6.4-3.42"/><path d="M12 12.65V22"/></svg>
                    </div>
                    <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Brand Identity</h3>
                    <p class="text-sm text-slate-600 dark:text-slate-400">
                        Easily upload your logo and use consistent colors.
                    </p>
                </div>
            </div>
        </section>

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
