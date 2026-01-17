<script lang="ts">
  import { FileImage, History, Zap, Lock, Smartphone } from 'lucide-svelte';
  import Workspace from '$lib/components/pixel-forge/Workspace.svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import { marked } from 'marked';

  $: dict = getDictionary($page.params.lang);

  // SEO & Meta
  $: title = dict.pixelForge.title;
  $: description = dict.pixelForge.description;

  // Helper to render markdown safely
  const renderMarkdown = (text: string) => marked.parse(text);
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content="website" />
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
    <Workspace {dict} />
  </main>

  <!-- Features Grid -->
  <section class="grid md:grid-cols-3 gap-8 pt-12 border-t border-slate-800">
     <div class="space-y-3">
        <div class="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
            <Zap class="w-5 h-5 text-indigo-400" />
        </div>
        <h3 class="text-lg font-bold text-slate-200">Lightning Fast</h3>
        <div class="text-slate-400 text-sm leading-relaxed">
            {@html renderMarkdown(dict.pixelForge.guide.featuresTitle.f1)}
        </div>
     </div>

     <div class="space-y-3">
        <div class="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
            <Lock class="w-5 h-5 text-indigo-400" />
        </div>
        <h3 class="text-lg font-bold text-slate-200">Privacy First</h3>
        <div class="text-slate-400 text-sm leading-relaxed">
             {@html renderMarkdown(dict.pixelForge.guide.featuresTitle.f2)}
        </div>
     </div>

     <div class="space-y-3">
        <div class="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
            <Smartphone class="w-5 h-5 text-indigo-400" />
        </div>
        <h3 class="text-lg font-bold text-slate-200">Mobile Optimized</h3>
        <div class="text-slate-400 text-sm leading-relaxed">
             {@html renderMarkdown(dict.pixelForge.guide.featuresTitle.f3)}
        </div>
     </div>
  </section>

  <!-- Documentation -->
  <article class="prose prose-invert prose-slate max-w-none pt-12 border-t border-slate-800">
    <h2>{dict.pixelForge.guide.title}</h2>
    <p>
      {dict.pixelForge.guide.intro}
    </p>

    <h3>Supported Formats</h3>
    <ul>
      <li><strong>WebP:</strong> The modern standard. Superior compression with alpha transparency support.</li>
      <li><strong>JPEG:</strong> Best for photographs where high color depth is needed.</li>
      <li><strong>PNG:</strong> Lossless compression, ideal for graphics and transparent images.</li>
    </ul>

    <h3>{dict.pixelForge.guide.tipsTitle}</h3>
    <ul>
        <li>{@html renderMarkdown(dict.pixelForge.guide.tip1)}</li>
        <li>{@html renderMarkdown(dict.pixelForge.guide.tip2)}</li>
        <li>{@html renderMarkdown(dict.pixelForge.guide.tip3)}</li>
    </ul>

    <!-- FAQ for Schema -->
    <h3>{dict.pixelForge.faqTitle}</h3>
    <dl class="space-y-4">
        <div>
            <dt class="font-bold text-slate-200">{dict.pixelForge.q1}</dt>
            <dd class="text-slate-400">{dict.pixelForge.a1}</dd>
        </div>
        <div>
            <dt class="font-bold text-slate-200">{dict.pixelForge.q2}</dt>
            <dd class="text-slate-400">{dict.pixelForge.a2}</dd>
        </div>
        <div>
            <dt class="font-bold text-slate-200">{dict.pixelForge.q3}</dt>
            <dd class="text-slate-400">{dict.pixelForge.a3}</dd>
        </div>
    </dl>
  </article>
</div>
