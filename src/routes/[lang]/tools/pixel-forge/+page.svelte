<script lang="ts">
  import GuideSection from '$lib/components/GuideSection.svelte';
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { FileImage, Zap, Lock, Smartphone } from 'lucide-svelte';
  import Workspace from '$lib/components/pixel-forge/Workspace.svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import { marked } from 'marked';
  import FAQSection from '$lib/components/FAQSection.svelte';
  $: lang = $page.params.lang || 'en';

  $: dict = getDictionary($page.params.lang);
  $: toolDict = dict.tools.pixelForge;

  // SEO & Meta
  $: title = `${toolDict.title} - ${dict.common.category}`; // e.g. Pixel Forge - Image Tools
  $: description = toolDict.description;

  $: faqItems = [
    { q: toolDict?.q1, a: toolDict?.a1 },
    { q: toolDict?.q2, a: toolDict?.a2 },
    { q: toolDict?.q3, a: toolDict?.a3 }
  ];

  $: jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/pixel-forge",
        "isAccessibleForFree": true,
        "name": "Pixel Forge",
        "description": description,
        "applicationCategory": "DesignApplication",
        "operatingSystem": "Web, Android, iOS",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
           "Client-side processing",
           "WebP/JPEG/PNG conversion",
           "Smart compression",
           "Privacy focused metadata stripping",
           "Text Watermarking",
           "Magic Palette Extraction",
           "Offline capability"
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqItems.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.a
          }
        }))
      }
    ]
  });

  // Helper to render markdown safely
  const renderMarkdown = (text: string) => marked.parse(text);
</script>
<Head
  title={title}
  description={description}
  keywords="image optimizer, webp converter, watermark images, extract color palette, strip exif metadata, image compressor, resize image, privacy focused, client side, pixel forge"
/>


<svelte:head>



    <link rel="alternate" hreflang="en" href="https://selfgrowingmicrotool.com/en/tools/pixel-forge" />
  <link rel="alternate" hreflang="ko" href="https://selfgrowingmicrotool.com/ko/tools/pixel-forge" />
  <link rel="alternate" hreflang="x-default" href="https://selfgrowingmicrotool.com/en/tools/pixel-forge" />

  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html '<script type="application/ld+json">' + jsonLd + '</scr' + 'ipt>'}
</svelte:head>

<div class="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-12">

  <!-- Header -->
  <header class="text-center space-y-4">
    <div class="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-4">
      <FileImage class="w-8 h-8 text-indigo-400" />
    </div>
    <h1 class="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
      Pixel <span class="text-indigo-500">Forge</span>
    </h1>
    <p class="text-lg text-slate-400 max-w-2xl mx-auto">
      {description}
    </p>
  </header>

  <!-- Main Tool -->
  <main>
    <Workspace dict={toolDict} />
    <div class="mt-12">
    <RelatedTools {lang} currentSlug="pixel-forge" currentCategory="design" />
  </div>
</main>

  <!-- Features Grid -->
  <section class="grid md:grid-cols-3 gap-8 pt-12 border-t border-slate-800">
     <div class="space-y-3">
        <div class="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
            <Zap class="w-5 h-5 text-indigo-400" />
        </div>
        <h3 class="text-lg font-bold text-slate-200">Lightning Fast</h3>
        <div class="text-slate-400 text-sm leading-relaxed">
            {@html renderMarkdown(toolDict.guide.f1)}
        </div>
     </div>

     <div class="space-y-3">
        <div class="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
            <Lock class="w-5 h-5 text-indigo-400" />
        </div>
        <h3 class="text-lg font-bold text-slate-200">Privacy First</h3>
        <div class="text-slate-400 text-sm leading-relaxed">
             {@html renderMarkdown(toolDict.guide.f2)}
        </div>
     </div>

     <div class="space-y-3">
        <div class="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
            <Smartphone class="w-5 h-5 text-indigo-400" />
        </div>
        <h3 class="text-lg font-bold text-slate-200">Mobile Optimized</h3>
        <div class="text-slate-400 text-sm leading-relaxed">
             {@html renderMarkdown(toolDict.guide.f3)}
        </div>
     </div>
  </section>

  <!-- Documentation -->
  <article class="prose prose-invert prose-slate max-w-none pt-12 border-t border-slate-800">
    <h2>{toolDict.guide.title}</h2>
    <p>
      {toolDict.guide.intro}
    </p>

    <h3>Supported Formats</h3>
    <ul>
      <li><strong>WebP:</strong> The modern standard. Superior compression with alpha transparency support.</li>
      <li><strong>JPEG:</strong> Best for photographs where high color depth is needed.</li>
      <li><strong>PNG:</strong> Lossless compression, ideal for graphics and transparent images.</li>
    </ul>

    <h3>{toolDict.guide.tipsTitle}</h3>
    <ul>
        <li>{@html renderMarkdown(toolDict.guide.tip1)}</li>
        <li>{@html renderMarkdown(toolDict.guide.tip2)}</li>
        <li>{@html renderMarkdown(toolDict.guide.tip3)}</li>
    </ul>

  </article>

  <GuideSection dict={toolDict} />
  <AdPlaceholder />
  <FAQSection title={toolDict.faqTitle} items={faqItems} />
</div>
