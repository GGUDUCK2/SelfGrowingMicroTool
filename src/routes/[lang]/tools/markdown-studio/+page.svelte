<script lang="ts">
  import GuideSection from '$lib/components/GuideSection.svelte';
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import { onMount } from 'svelte';
  import { marked } from 'marked';
  import { fade, slide } from 'svelte/transition';
  import { page } from '$app/stores';
  import { ArrowLeft, History, X, Trash2, Check } from '@lucide/svelte';
  import Head from '$lib/components/Head.svelte';
  import { getDictionary } from '$lib/dictionaries';
  import MarkdownEditor from '$lib/components/markdown-studio/MarkdownEditor.svelte';
  import MarkdownPreview from '$lib/components/markdown-studio/MarkdownPreview.svelte';
  import MarkdownToolbar from '$lib/components/markdown-studio/MarkdownToolbar.svelte';
  import { db, type MarkFlowHistory } from '$lib/db';
  import { copyToClipboard as copyToClipboardUtil } from '$lib/utils';
  import { liveQuery } from 'dexie';
  import FAQSection from '$lib/components/FAQSection.svelte';

  // State
  let content = "";
  let activeTab = "editor"; // 'editor', 'preview', 'split' (desktop only)
  let editorComponent: MarkdownEditor;
  let showHistory = false;
  let notification: string | null = null;

  // Reactivity
  $: lang = $page.params.lang || 'en';
  $: dict = (getDictionary(lang) as any)?.tools?.markdownStudio;
  $: commonDict = getDictionary(lang).common;

  // Stats
  $: wordCount = content ? content.trim().split(/\s+/).length : 0;
  $: charCount = content ? content.length : 0;
  $: readingTime = Math.ceil(wordCount / 200);

  $: schema = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/markdown-studio",
        "isAccessibleForFree": true,
      "name": "MarkFlow",
      "headline": dict.title,
      "alternativeHeadline": "Online Markdown Editor",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Any",
      "dateModified": new Date().toISOString(),
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": dict.description,
      "featureList": [
        "Real-time Markdown Preview",
        "Export to HTML",
        "Markdown Templates",
        "Local History",
        "GitHub Flavored Markdown"
      ],
      "screenshot": "https://selfgrowingmicrotool.com/og-image.jpg",
      "url": $page.url.href,
      "author": {
          "@type": "Organization",
          "name": "MicroFactory"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": (dict as any)?.q1,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": (dict as any)?.a1
          }
        },
        {
          "@type": "Question",
          "name": (dict as any)?.q2,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": (dict as any)?.a2
          }
        },
        {
          "@type": "Question",
          "name": (dict as any)?.q3,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": (dict as any)?.a3
          }
        }
      ]
    }
  ];

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
      "name": dict.title,
      "item": `https://selfgrowingmicrotool.com/${lang}/tools/markdown-studio`
    }]
  };

  // History observable
  $: history = liveQuery(() => db.markFlowHistory?.orderBy('createdAt').reverse().toArray() || []);

  onMount(() => {
    // Auto-load last draft if empty
    db.markFlowHistory?.orderBy('createdAt').last().then((item) => {
       if (item && !content) {
          content = item.content;
       }
    });
  });

  // Actions
  function handleAction(event: CustomEvent<string>) {
    const action = event.detail;

    switch(action) {
      case 'bold': insert('**text**', 2, 4); break;
      case 'italic': insert('*text*', 1, 4); break;
      case 'heading': insert('# ', 2, 0); break;
      case 'link': insert('[text](url)', 1, 4); break;
      case 'image': insert('![alt](url)', 2, 3); break;
      case 'listUl': insert('\n- ', 3, 0); break;
      case 'listOl': insert('\n1. ', 4, 0); break;
      case 'quote': insert('\n> ', 3, 0); break;
      case 'code': insert('```\ncode\n```', 4, 4); break;
      case 'table': insert('\n| Header | Header |\n| --- | --- |\n| Cell | Cell |', 0, 0); break;
      case 'rule': insert('\n---\n', 0, 0); break;
      case 'save': saveToHistory(); break;
      case 'clear':
        if(confirm('Are you sure?')) content = "";
        break;
      case 'copy': copyToClipboard(content); break;
      case 'copyHtml': copyHtml(); break;
      case 'download': downloadMarkdown(); break;
      case 'print': window.print(); break;
    }
  }

  function insert(text: string, offset: number, length: number) {
    if (editorComponent) {
      editorComponent.insertAtCursor(text, offset, length);
    }
  }

  async function saveToHistory() {
    if (!content.trim()) return;
    try {
      await db.markFlowHistory.add({
        content: content,
        createdAt: new Date(),
        starred: 0
      });
      showNotification(dict.feedback.saved);
    } catch (err) {
      console.error(err);
    }
  }

  function loadHistoryItem(item: MarkFlowHistory) {
    content = item.content;
    showHistory = false;
  }

  function deleteHistoryItem(id?: number) {
    if (id) db.markFlowHistory.delete(id);
  }

  function clearHistory() {
    db.markFlowHistory.clear();
  }

  async function copyToClipboard(text: string) {
    try {
      await copyToClipboardUtil(text);
      showNotification(dict.feedback.copied);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  }

  async function copyHtml() {
     // We need to render it first if not already rendered,
     // but we can trust the preview logic or use marked directly again.
     // For simplicity, we can grab the HTML from the preview component if accessible,
     // or just re-parse. Re-parsing is safer.
     const html = await marked.parse(content);
     copyToClipboard(html as string);
  }

  function downloadMarkdown() {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `markflow-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function showNotification(msg: string) {
    notification = msg;
    setTimeout(() => notification = null, 2000);
  }

  // Templates
  const templates = [
    { name: 'README', content: '# Project Title\n\nDescription of the project.\n\n## Installation\n\n```bash\nnpm install\n```\n\n## Usage\n\n```javascript\nimport { foo } from "bar";\n```' },
    { name: 'Blog Post', content: '---\ntitle: Blog Post Title\ndate: 2024-01-01\n---\n\n# Introduction\n\nWrite your intro here.\n\n## Section 1\n\nDetails...' },
    { name: 'Checklist', content: '# Checklist\n\n- [ ] Task 1\n- [ ] Task 2\n- [x] Completed Task' }
  ];

  function applyTemplate(tmpl: { content: string }) {
    if (content && !confirm('Replace current content?')) return;
    content = tmpl.content;
  }

</script>

<Head
  title={dict.title}
  description={dict.description}
  image="https://selfgrowingmicrotool.com/og/default.png"
  url={"https://selfgrowingmicrotool.com/" + lang + "/tools/markdown-studio"}
  keywords="markdown editor, online markdown editor, github flavored markdown, markdown preview, markdown to html"
/>

<svelte:head>
  <link rel="canonical" href={"https://selfgrowingmicrotool.com/" + lang + "/tools/markdown-studio"} />
  <link rel="alternate" hreflang="en" href="https://selfgrowingmicrotool.com/en/tools/markdown-studio" />
  <link rel="alternate" hreflang="ko" href="https://selfgrowingmicrotool.com/ko/tools/markdown-studio" />
  <link rel="alternate" hreflang="x-default" href="https://selfgrowingmicrotool.com/en/tools/markdown-studio" />
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(schema)}</scr` + `ipt>`}
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</scr` + `ipt>`}
</svelte:head>

<div class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 font-sans">

  <!-- Header -->
  <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 print:hidden">
    <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <a href="/{lang}" class="text-slate-500 hover:text-indigo-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center p-2 -ml-2 rounded-lg" aria-label={commonDict.back}>
          <ArrowLeft size={20} />
        </a>
        <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
          MarkFlow
        </h1>
      </div>

      <div class="flex items-center gap-3">
         <!-- Template Dropdown -->
         <select
           class="bg-slate-100 dark:bg-slate-800 border-none text-sm rounded-lg px-3 py-2 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-slate-700 dark:text-slate-300 min-h-[44px]"
           on:change={(e) => applyTemplate(templates[e.currentTarget.selectedIndex - 1])}
         >
           <option disabled selected>{dict.templates}</option>
           {#each templates as tmpl}
             <option>{tmpl.name}</option>
           {/each}
         </select>

         <button
           class="p-2 text-slate-500 hover:text-indigo-600 relative hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
           on:click={() => showHistory = !showHistory}
           title={dict.history}
         >
           <History size={20} />
         </button>
      </div>
    </div>
  </header>

  <!-- Main Workspace -->
  <main class="flex-1 flex flex-col max-w-7xl mx-auto w-full px-0 sm:px-4 py-4 gap-4 h-[calc(100dvh-4rem)]">

    <!-- Toolbar -->
    <div class="sticky top-16 z-20 shadow-sm print:hidden">
       <MarkdownToolbar dictionary={dict} hasContent={content.length > 0} on:action={handleAction} />
    </div>

    <!-- Mobile Tabs -->
    <div class="sm:hidden flex border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 print:hidden">
      <button
        class="flex-1 py-2 min-h-[44px] min-w-[44px] text-sm font-medium {activeTab === 'editor' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}"
        on:click={() => activeTab = 'editor'}
      >
        {dict.input}
      </button>
      <button
        class="flex-1 py-2 min-h-[44px] min-w-[44px] text-sm font-medium {activeTab === 'preview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}"
        on:click={() => activeTab = 'preview'}
      >
        {dict.preview}
      </button>
    </div>

    <!-- Editor / Preview Split -->
    <div class="flex-1 flex flex-col sm:flex-row gap-4 min-h-0 relative">

      <!-- Editor Pane -->
      <div class="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-b-lg sm:rounded-lg shadow-sm overflow-hidden
                  {activeTab === 'preview' ? 'hidden sm:flex' : 'flex'}"
           class:sm:hidden={false}
      >
        <div class="flex-1 relative overflow-y-auto">
          <MarkdownEditor
            bind:this={editorComponent}
            bind:value={content}
            dictionary={dict}
            on:save={saveToHistory}
            on:change={() => {}}
          />
        </div>
        <!-- Stats Bar -->
        <div class="min-h-[2rem] py-1 flex-wrap bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center px-4 text-xs text-slate-500 gap-4 select-none print:hidden">
           <span>{wordCount} {dict.words}</span>
           <span>{charCount} {dict.chars}</span>
           <span>{readingTime} min read</span>
        </div>
      </div>

      <!-- Preview Pane -->
      <div class="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-b-lg sm:rounded-lg shadow-sm overflow-hidden
                  {activeTab === 'editor' ? 'hidden sm:flex' : 'flex'}"
           class:sm:hidden={false}
      >
        <div class="flex-1 overflow-y-auto print:overflow-visible">
          <MarkdownPreview {content} />
        </div>
      </div>
    </div>


  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="markdown-studio" currentCategory="dev" />
  </div>
</main>

  <!-- Content for SEO/Landing below the tool -->
  <section class="max-w-4xl mx-auto px-6 py-12 space-y-12 print:hidden">
    <div class="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl p-8 border border-indigo-100 dark:border-indigo-900/30">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-4">{dict.guide.title}</h2>
      <p class="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
        {dict.guide.intro}
      </p>

      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <h3 class="font-semibold text-slate-900 dark:text-white mb-2">{dict.guide.featuresTitle}</h3>
          <ul class="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li class="flex items-start gap-2">
              <span class="text-indigo-500 mt-1">✓</span>
              <span>{@html marked.parseInline(dict.guide.f1)}</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-indigo-500 mt-1">✓</span>
              <span>{@html marked.parseInline(dict.guide.f2)}</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-indigo-500 mt-1">✓</span>
              <span>{@html marked.parseInline(dict.guide.f3)}</span>
            </li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold text-slate-900 dark:text-white mb-2">{dict.guide.tipsTitle}</h3>
          <ul class="space-y-2 text-sm text-slate-600 dark:text-slate-400">
             <li class="flex items-start gap-2">
              <span class="text-amber-500 mt-1">💡</span>
              <span>{@html marked.parseInline(dict.guide.tip1)}</span>
            </li>
             <li class="flex items-start gap-2">
              <span class="text-amber-500 mt-1">💡</span>
              <span>{@html marked.parseInline(dict.guide.tip2)}</span>
            </li>
             <li class="flex items-start gap-2">
              <span class="text-amber-500 mt-1">💡</span>
              <span>{@html marked.parseInline(dict.guide.tip3)}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <GuideSection {...(dict as any)?.guide} />
  <AdPlaceholder />
  <FAQSection
      title={dict.faqTitle}
      items={[
        { q: (dict as any)?.q1, a: (dict as any)?.a1 },
        { q: (dict as any)?.q2, a: (dict as any)?.a2 },
        { q: (dict as any)?.q3, a: (dict as any)?.a3 }
      ]}
    />


  </section>

  <!-- History Drawer -->
  {#if showHistory}
    <div class="fixed inset-0 z-50 flex justify-end" transition:fade={{ duration: 200 }}>
      <button class="absolute inset-0 bg-black/20 backdrop-blur-sm min-h-[44px] min-w-[44px] flex items-center justify-center min-h-[44px] min-w-[44px]" on:click={() => showHistory = false} aria-label="Close history"></button>
      <div class="relative w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl h-full overflow-y-auto" transition:slide={{ axis: 'x', duration: 300 }}>
        <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 class="font-semibold text-slate-900 dark:text-white">{dict.history}</h3>
          <button class="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 min-h-[44px] min-w-[44px]" on:click={() => showHistory = false} aria-label="Close history">
            <X size={20} />
          </button>
        </div>
        <div class="p-4">
           {#if $history}
             <div class="space-y-2">
               {#each $history as item}
                 <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg group hover:ring-1 hover:ring-indigo-500 transition-all cursor-pointer relative"
                      on:click={() => loadHistoryItem(item)}
                      on:keydown={(e) => e.key === 'Enter' && loadHistoryItem(item)}
                      role="button"
                      tabindex="0"
                 >
                   <div class="text-xs text-slate-400 mb-1">{item.createdAt.toLocaleString()}</div>
                   <div class="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 font-mono text-xs">
                     {item.content || '(Empty)'}
                   </div>
                   <button
                     class="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity min-h-[44px] min-w-[44px]"
                     on:click|stopPropagation={() => deleteHistoryItem(item.id)}
                   >
                     <Trash2 size={14} />
                   </button>
                 </div>
               {/each}
               {#if $history.length === 0}
                 <p class="text-center text-slate-500 py-8">{dict.historyEmpty || "No history"}</p>
               {/if}
             </div>
             {#if $history.length > 0}
                <button
                  class="w-full mt-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
                  on:click={clearHistory}
                >
                  {dict.clear}
                </button>
             {/if}
           {/if}
        </div>
      </div>
    </div>
  {/if}

  <!-- Notification Toast -->
  {#if notification}
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg text-sm z-50 flex items-center gap-2" transition:fade>
      <Check size={16} class="text-green-400" />
      {notification}
    </div>
  {/if}

</div>

<style>
  /* Print Styles */
  @media print {
    :global(body), :global(main) {
      background: white !important;
      color: black !important;
      height: auto !important;
      overflow: visible !important;
    }
    :global(header), :global(footer), :global(.print\:hidden) {
      display: none !important;
    }
    :global(.prose) {
      max-width: 100% !important;
    }
  }
</style>
