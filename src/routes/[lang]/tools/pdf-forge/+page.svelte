<script lang="ts">
  import GuideSection from '$lib/components/GuideSection.svelte';
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { FileText, Shield, Layers, Zap } from '@lucide/svelte';
  import Workspace from '$lib/components/pdf-forge/Workspace.svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import { marked } from 'marked';

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang);
  $: toolDict = (dict as any)?.tools?.pdfForge || {};

  // SEO
  $: title = `${toolDict.title} - ${dict.home.title}`;
  $: description = toolDict.description;
  $: canonical = `${$page.url.origin}/${lang}/tools/pdf-forge`;

  $: schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
        "@id": $page.url.origin + "/" + lang + "/tools/pdf-forge",
        "isAccessibleForFree": true,
    "name": "PDF Forge",
    "headline": toolDict.title,
    "description": description,
    "applicationCategory": "ProductivityApplication",
    "applicationSubCategory": "PDF Utility",
    "operatingSystem": "Web, iOS, Android, Linux, Windows, macOS",
    "browserRequirements": "Requires JavaScript. HTML5.",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
    },
    "featureList": "Merge PDF, Split PDF, Rotate PDF Pages, Client-side Privacy, Reorder Pages, Image to PDF, JPG to PDF, Offline Session History, Keyboard Shortcuts, Zipper Merge, Export PDF to Images, PDF Watermark",
    "url": canonical,
    "author": {
        "@type": "Organization",
        "name": "MicroFactory"
    },
    "screenshot": `${$page.url.origin}/og/pdf-forge.png`,
    "datePublished": "2023-10-20",
    "dateModified": new Date().toISOString()
  };

    const renderMarkdown = (text: string) => marked.parse(text);
</script>
<Head
  title={title}
  description={description}
  keywords="merge pdf, split pdf, rotate pdf, combine pdf, free pdf tool, privacy focus pdf, client side pdf editor, image to pdf, jpg to pdf, png to pdf, offline pdf editor, pdf session history, secure pdf merger, reorganize pdf pages, extract pdf pages, local pdf tools, zipper merge pdf, pdf watermark, pdf to image, export pdf pages"
/>


<svelte:head>
  <link rel="canonical" href={$page.url.origin + "/" + lang + "/tools/pdf-forge"} />
  <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/pdf-forge"} />
  <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/pdf-forge"} />
  <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/pdf-forge"} />
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</scr` + `ipt>`}


  {@html `<script type="application/ld+json">

  </scr` + `ipt>`}

</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
  <!-- Hero -->
  <header class="text-center space-y-6">
    <div class="inline-flex items-center justify-center p-4 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-3xl mb-4">
      <FileText class="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
    </div>
    <h1 class="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">
      PDF <span class="text-indigo-600 dark:text-indigo-400">Forge</span>
    </h1>
    <p class="text-xl text-slate-600 dark:text-slate-400 max-w-7xl mx-auto leading-relaxed">
      {description}
    </p>
  </header>

  <!-- Workspace -->
  <main class="bg-white dark:bg-slate-900 rounded-3xl shadow-xl dark:shadow-2xl dark:shadow-indigo-900/10 border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[600px] relative z-10">
    <Workspace dict={toolDict} />
</main>

  <!-- Features -->
  <section class="grid grid-cols-1 md:grid-cols-3 gap-8">
     <article class="bg-white dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm min-h-[44px] min-w-[44px]">
        <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
            <Layers class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Organize with Ease</h3>
        <div class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed prose prose-sm dark:prose-invert">
            {@html renderMarkdown(toolDict.guide.f1)}
        </div>
     </article>
     <article class="bg-white dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm min-h-[44px] min-w-[44px]">
        <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
            <Zap class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Visual Editor</h3>
        <div class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed prose prose-sm dark:prose-invert">
            {@html renderMarkdown(toolDict.guide.f2)}
        </div>
     </article>
     <article class="bg-white dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm min-h-[44px] min-w-[44px]">
        <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
            <Shield class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Privacy First</h3>
        <div class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed prose prose-sm dark:prose-invert">
            {@html renderMarkdown(toolDict.guide.f3)}
        </div>
     </article>
  </section>

  <GuideSection {...toolDict?.guide} />
  <AdPlaceholder />
  <FAQSection
      title={toolDict.faqTitle}
      items={[
          { q: toolDict.q1, a: toolDict.a1 },
          { q: toolDict.q2, a: toolDict.a2 },
          { q: toolDict.q3, a: toolDict.a3 }
      ]}
  />
  <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="pdf-forge" currentCategory="productivity" />
</div>
