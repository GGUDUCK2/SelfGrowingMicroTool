<script lang="ts">
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import { db, type DiagramForgeHistory } from '$lib/db';
  import Editor from '$lib/components/diagram-forge/Editor.svelte';
  import Preview from '$lib/components/diagram-forge/Preview.svelte';
  import Toolbar from '$lib/components/diagram-forge/Toolbar.svelte';
  import HistorySidebar from '$lib/components/diagram-forge/HistorySidebar.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
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

  $: faqItems = [
    { q: t.q1, a: t.a1 },
    { q: t.q2, a: t.a2 },
    { q: t.q3, a: t.a3 }
  ];

  $: schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/diagram-forge",
        "isAccessibleForFree": true,
        "name": "Diagram Forge",
        "description": t.description,
        "applicationCategory": "DesignApplication",
        "operatingSystem": "Any",
        "url": `https://selfgrowingmicrotool.com/${lang}/tools/diagram-forge`,
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
        ],
        "screenshot": "https://selfgrowingmicrotool.com/assets/og/diagram-forge.png",
        "softwareRequirements": "Modern Web Browser"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `https://selfgrowingmicrotool.com/${lang}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Diagram Forge",
            "item": `https://selfgrowingmicrotool.com/${lang}/tools/diagram-forge`
          }
        ]
      }
    ]
  };

  $: jsonLdScript = `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}<\/script>`;
</script>
<Head
  title={t.title}
  description={t.description}
/>


<svelte:head>
                        {@html jsonLdScript}

  {@html `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "${dict?.q1}",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "${dict?.a1}"
        }
      },
      {
        "@type": "Question",
        "name": "${dict?.q2}",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "${dict?.a2}"
        }
      },
      {
        "@type": "Question",
        "name": "${dict?.q3}",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "${dict?.a3}"
        }
      }
    ]
  }
  </script>`}

</svelte:head>

<div class="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-slate-900">
    <!-- Sidebar -->
    <div class="fixed inset-y-0 left-0 z-50 h-full bg-white dark:bg-slate-800 shadow-xl transform transition-transform duration-300 md:relative md:translate-x-0 md:shadow-none border-r border-slate-200 dark:border-slate-700 {showSidebar ? 'translate-x-0' : '-translate-x-full'} pt-16 md:pt-0 w-80">
        <div class="absolute top-4 right-4 md:hidden">
            <button class="min-h-[44px] min-w-[44px] p-2 text-slate-500" on:click={() => showSidebar = false}>
                <X class="w-6 h-6" />
            </button>
        </div>
        <HistorySidebar {dict} onLoad={handleLoadHistory} />
    </div>

    {#if showSidebar}
        <button class="min-h-[44px] min-w-[44px] fixed inset-0 bg-black/50 z-40 md:hidden" on:click={() => showSidebar = false} aria-label="Close Sidebar"></button>
    {/if}

    <div class="flex-1 flex flex-col min-w-0 h-full">
        <!-- Mobile Header -->
        <div class="md:hidden flex items-center p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <button class="min-h-[44px] min-w-[44px] mr-4 text-slate-500" on:click={() => showSidebar = true}>
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
        <GuideSection
            title={t.guide.title}
            intro={t.guide.intro}
            featuresTitle={t.guide.featuresTitle}
            f1={t.guide.f1}
            f2={t.guide.f2}
            f3={t.guide.f3}
            tipsTitle={t.guide.tipsTitle}
            tip1={t.guide.tip1}
            tip2={t.guide.tip2}
            tip3={t.guide.tip3}
        />

        <FAQSection
            title={t.faqTitle}
            items={faqItems}
        />
    </div>
</div>

  <div class="mt-12 mb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <RelatedTools {lang} currentSlug="diagram-forge" currentCategory="dev" />
  </div>
