<script lang="ts">
  import { FileText, Shield, Layers, Zap } from 'lucide-svelte';
  import Workspace from '$lib/components/pdf-forge/Workspace.svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import { marked } from 'marked';

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang);
  $: toolDict = dict.tools.pdfForge;

  // SEO
  $: title = `${toolDict.title} - ${dict.home.title}`;
  $: description = toolDict.description;
  $: canonical = `https://selfgrowingmicrotool.com/${lang}/tools/pdf-forge`;

  $: schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
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
    "screenshot": "https://selfgrowingmicrotool.com/og/pdf-forge.png",
    "datePublished": "2023-10-20",
    "dateModified": new Date().toISOString()
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
      "name": "PDF Forge",
      "item": canonical
    }]
  };

  const renderMarkdown = (text: string) => marked.parse(text);
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="keywords" content="merge pdf, split pdf, rotate pdf, combine pdf, free pdf tool, privacy focus pdf, client side pdf editor, image to pdf, jpg to pdf, png to pdf, offline pdf editor, pdf session history, secure pdf merger, reorganize pdf pages, extract pdf pages, local pdf tools, zipper merge pdf, pdf watermark, pdf to image, export pdf pages" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonical} />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="https://selfgrowingmicrotool.com/og/pdf-forge.png" />
  <link rel="canonical" href={canonical} />
  {@html `<script type="application/ld+json">${JSON.stringify(schema)}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`}
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-12 space-y-16 font-sans">
  <!-- Hero -->
  <header class="text-center space-y-6">
    <div class="inline-flex items-center justify-center p-4 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-3xl mb-4">
      <FileText class="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
    </div>
    <h1 class="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">
      PDF <span class="text-indigo-600 dark:text-indigo-400">Forge</span>
    </h1>
    <p class="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
      {description}
    </p>
  </header>

  <!-- Workspace -->
  <main class="bg-white dark:bg-slate-900 rounded-3xl shadow-xl dark:shadow-2xl dark:shadow-indigo-900/10 border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[600px] relative z-10">
    <Workspace dict={toolDict} />
  </main>

  <!-- Features -->
  <section class="grid md:grid-cols-3 gap-8">
     <article class="bg-white dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
            <Layers class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Organize with Ease</h3>
        <div class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed prose prose-sm dark:prose-invert">
            {@html renderMarkdown(toolDict.guide.f1)}
        </div>
     </article>
     <article class="bg-white dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
            <Zap class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Visual Editor</h3>
        <div class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed prose prose-sm dark:prose-invert">
            {@html renderMarkdown(toolDict.guide.f2)}
        </div>
     </article>
     <article class="bg-white dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
            <Shield class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Privacy First</h3>
        <div class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed prose prose-sm dark:prose-invert">
            {@html renderMarkdown(toolDict.guide.f3)}
        </div>
     </article>
  </section>

  <!-- Guide & FAQ -->
  <div class="grid lg:grid-cols-12 gap-12 pt-12 border-t border-slate-200 dark:border-slate-800">
      <article class="lg:col-span-7 prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
          <h2 class="text-slate-900 dark:text-white">{toolDict.guide.title}</h2>
          <p class="lead">{toolDict.guide.intro}</p>

          <h3 class="text-slate-900 dark:text-white">{toolDict.guide.tipsTitle}</h3>
          <ul>
              <li>{@html renderMarkdown(toolDict.guide.tip1)}</li>
              <li>{@html renderMarkdown(toolDict.guide.tip2)}</li>
              <li>{@html renderMarkdown(toolDict.guide.tip3)}</li>
          </ul>
      </article>

      <div class="lg:col-span-5 space-y-8">
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
