<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import { db, type DiagramForgeHistory } from '$lib/db';
  import Editor from '$lib/components/diagram-forge/Editor.svelte';
  import Preview from '$lib/components/diagram-forge/Preview.svelte';
  import Toolbar from '$lib/components/diagram-forge/Toolbar.svelte';
  import HistorySidebar from '$lib/components/diagram-forge/HistorySidebar.svelte';
  import { Menu, X } from 'lucide-svelte';
  import type { DiagramTemplate } from '$lib/utils/diagram-forge/types';
  import { templates } from '$lib/utils/diagram-forge/templates';

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang);
  $: t = dict.tools.diagramForge;

  let code = templates[0].code;
  let theme = 'default';
  let showSidebar = false;
  let scale = 1;
  let type = templates[0].type;

  onMount(() => {
      const hash = window.location.hash.slice(1);
      if (hash) {
          try {
              const decoded = atob(hash);
              const data = JSON.parse(decoded);
              code = data.code;
              theme = data.theme || 'default';
          } catch (e) {
              console.error('Failed to load from URL', e);
          }
      }
  });

  $: {
      if (typeof window !== 'undefined') {
          try {
            const state = btoa(JSON.stringify({ code, theme }));
            history.replaceState(null, '', `#${state}`);
          } catch (e) {
              // Ignore compression errors
          }
      }
  }

  async function handleSave() {
      let detectedType = 'flowchart';
      if (code.includes('sequenceDiagram')) detectedType = 'sequence';
      else if (code.includes('classDiagram')) detectedType = 'class';
      else if (code.includes('gantt')) detectedType = 'gantt';
      else if (code.includes('pie')) detectedType = 'pie';
      else if (code.includes('erDiagram')) detectedType = 'er';
      else if (code.includes('stateDiagram')) detectedType = 'state';
      else if (code.includes('gitGraph')) detectedType = 'git';
      else if (code.includes('mindmap')) detectedType = 'mindmap';

      const title = prompt('Diagram Name:', `${detectedType} - ${new Date().toLocaleTimeString()}`);
      if (!title) return;

      await db.diagramForgeHistory.add({
          title,
          code,
          type: detectedType,
          createdAt: new Date(),
          starred: 0
      });
      alert(t.saved);
  }

  function handleLoadHistory(item: DiagramForgeHistory) {
      code = item.code;
      showSidebar = false;
  }

  function handleLoadTemplate(item: DiagramTemplate) {
      if (confirm('Replace current diagram?')) {
          code = item.code;
          type = item.type;
      }
  }

  function handleExport(format: 'svg' | 'png') {
      const svgEl = document.querySelector('.mermaid-container svg');
      if (!svgEl) {
          alert('No diagram to export!');
          return;
      }

      const svgData = new XMLSerializer().serializeToString(svgEl);

      if (format === 'svg') {
          const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          triggerDownload(url, `diagram.${format}`);
      } else {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);

          img.onload = () => {
              const scale = 2;
              canvas.width = img.width * scale;
              canvas.height = img.height * scale;
              if (ctx) {
                  ctx.fillStyle = theme === 'dark' ? '#1e293b' : '#ffffff';
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  ctx.scale(scale, scale);
                  ctx.drawImage(img, 0, 0);
                  const pngUrl = canvas.toDataURL('image/png');
                  triggerDownload(pngUrl, 'diagram.png');
              }
              URL.revokeObjectURL(url);
          };
          img.src = url;
      }
  }

  function triggerDownload(url: string, filename: string) {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  }

  function handleCopyLink() {
      navigator.clipboard.writeText(window.location.href);
      alert(t.actions.copyLink + ' Copied!');
  }

  $: jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "Diagram Forge",
        "description": t.description,
        "applicationCategory": "ProductivityApplication",
        "operatingSystem": "Any",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
          "Text to Diagram",
          "Mermaid.js Editor",
          "Flowchart Maker",
          "Sequence Diagram Tool",
          "Offline Capable",
          "SVG Export"
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": t.q1,
            "acceptedAnswer": { "@type": "Answer", "text": t.a1 }
          },
          {
            "@type": "Question",
            "name": t.q2,
            "acceptedAnswer": { "@type": "Answer", "text": t.a2 }
          },
          {
            "@type": "Question",
            "name": t.q3,
            "acceptedAnswer": { "@type": "Answer", "text": t.a3 }
          }
        ]
      }
    ]
  });

  $: jsonLdScript = `<script type="application/ld+json">${jsonLd.replace(/</g, '\\u003c')}<\/script>`;
</script>

<svelte:head>
  <title>{t.title} | MicroFactory</title>
  <meta name="description" content={t.description} />
  {@html jsonLdScript}
</svelte:head>

<div class="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-slate-900">
    <!-- Sidebar -->
    <div class="fixed inset-y-0 left-0 z-50 h-full bg-white dark:bg-slate-800 shadow-xl transform transition-transform duration-300 md:relative md:translate-x-0 md:shadow-none border-r border-slate-200 dark:border-slate-700 {showSidebar ? 'translate-x-0' : '-translate-x-full'} pt-16 md:pt-0 w-80">
        <div class="absolute top-4 right-4 md:hidden">
            <button on:click={() => showSidebar = false} class="p-2 text-slate-500">
                <X class="w-6 h-6" />
            </button>
        </div>
        <HistorySidebar {dict} onLoad={handleLoadHistory} />
    </div>

    {#if showSidebar}
        <button class="fixed inset-0 bg-black/50 z-40 md:hidden" on:click={() => showSidebar = false} aria-label="Close Sidebar"></button>
    {/if}

    <div class="flex-1 flex flex-col min-w-0 h-full">
        <!-- Mobile Header -->
        <div class="md:hidden flex items-center p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <button on:click={() => showSidebar = true} class="mr-4 text-slate-500">
                <Menu size={24} />
            </button>
            <h1 class="font-bold text-slate-800 dark:text-white">Diagram Forge</h1>
        </div>

        <Toolbar
            dict={t}
            bind:theme
            on:loadTemplate={(e) => handleLoadTemplate(e.detail)}
            on:save={handleSave}
            on:export={(e) => handleExport(e.detail)}
            on:copyLink={handleCopyLink}
            on:zoomIn={() => scale += 0.1}
            on:zoomOut={() => scale = Math.max(0.1, scale - 0.1)}
        />

        <div class="flex-1 flex flex-col md:flex-row overflow-hidden">
            <div class="flex-1 border-r border-slate-200 dark:border-slate-700 min-h-[300px]">
                <Editor bind:value={code} placeholder="Enter Mermaid syntax..." />
            </div>
            <div class="flex-[1.5] relative bg-slate-50 dark:bg-slate-800 overflow-auto">
                <div class="min-w-full min-h-full flex items-center justify-center transition-transform duration-200 p-4" style="transform: scale({scale}); transform-origin: center;">
                    <Preview {code} {theme} />
                </div>
                <!-- Zoom Indicator -->
                {#if scale !== 1}
                    <div class="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs pointer-events-none">
                        {Math.round(scale * 100)}%
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<!-- Docs -->
<div class="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
    <div class="max-w-4xl mx-auto px-4 py-12">
        <article class="prose dark:prose-invert max-w-none">
            <h2 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 mb-6">
                {t.guide.title}
            </h2>
            <p class="text-lg text-slate-600 dark:text-slate-400 mb-8">
                {t.guide.intro}
            </p>

            <div class="grid md:grid-cols-2 gap-8 mb-12">
                <div class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl">
                    <h3 class="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">{t.guide.featuresTitle}</h3>
                    <ul class="space-y-2 text-slate-600 dark:text-slate-400 list-disc pl-5">
                        <li>{@html t.guide.f1}</li>
                        <li>{@html t.guide.f2}</li>
                        <li>{@html t.guide.f3}</li>
                    </ul>
                </div>

                <div class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl">
                    <h3 class="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">{t.guide.tipsTitle}</h3>
                    <ul class="space-y-2 text-slate-600 dark:text-slate-400 list-disc pl-5">
                        <li>{@html t.guide.tip1}</li>
                        <li>{@html t.guide.tip2}</li>
                        <li>{@html t.guide.tip3}</li>
                    </ul>
                </div>
            </div>

            <h3>{t.faqTitle}</h3>
            <dl class="space-y-6">
                <div class="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <dt class="font-bold text-slate-900 dark:text-white mb-2">{t.q1}</dt>
                    <dd class="text-slate-600 dark:text-slate-400">{t.a1}</dd>
                </div>
                <div class="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <dt class="font-bold text-slate-900 dark:text-white mb-2">{t.q2}</dt>
                    <dd class="text-slate-600 dark:text-slate-400">{t.a2}</dd>
                </div>
                <div class="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <dt class="font-bold text-slate-900 dark:text-white mb-2">{t.q3}</dt>
                    <dd class="text-slate-600 dark:text-slate-400">{t.a3}</dd>
                </div>
            </dl>
        </article>
    </div>
</div>
