<script lang="ts">
  import Head from '$lib/components/Head.svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import { fade } from 'svelte/transition';
  import { saveToHistory } from '$lib/db/workspace';
  import { GitBranch, Terminal, FileCode, MessageSquare, ChevronLeft, Check, Stethoscope } from 'lucide-svelte';

  import { onMount, onDestroy } from 'svelte';
  import CommandBuilder from '$lib/components/git-forge/CommandBuilder.svelte';
  import GitignoreGen from '$lib/components/git-forge/GitignoreGen.svelte';
  import CommitBuilder from '$lib/components/git-forge/CommitBuilder.svelte';
  import GitDoctor from '$lib/components/git-forge/GitDoctor.svelte';
  import HistoryPanel from '$lib/components/git-forge/HistoryPanel.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import type { GitForgeDictionary } from '$lib/components/git-forge/types';

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang)?.tools?.gitForge as GitForgeDictionary;
  $: common = getDictionary(lang)?.common;

  let activeTab: 'command' | 'ignore' | 'commit' | 'doctor' = 'command';
  let showToast = false;
  let toastMessage = '';

  let commandBuilderComponent: any;
  let commitBuilderComponent: any;
  let gitignoreGenComponent: any;

  function triggerToast(msg: string) {
      toastMessage = msg;
      showToast = true;
      setTimeout(() => showToast = false, 2000);
  }

  async function handleSave(event: CustomEvent) {
      const { type, content, details } = event.detail;
      try {
          await saveToHistory('git-forge', { type, content, details }, null);
          triggerToast('Saved to history!');
      } catch (e) {
          console.error('Failed to save', e);
      }
  }

  function handleCopy() {
      triggerToast(dict?.command?.copied);
  }

  function handleCopyAlias() {
      triggerToast(dict?.command?.aliasCreated);
  }

  function handleRestore(event: CustomEvent) {
      const item = event.detail;
      const type = item.input?.type;
      if (!type) return;

      activeTab = type;
      setTimeout(() => {
          if (type === 'command' && commandBuilderComponent) {
              commandBuilderComponent.restoreState(item.input);
              triggerToast('Command state restored');
          } else if (type === 'ignore' && gitignoreGenComponent) {
              gitignoreGenComponent.restoreState(item.input);
              triggerToast('Ignore template restored');
          } else if (type === 'commit' && commitBuilderComponent) {
              commitBuilderComponent.restoreState(item.input);
              triggerToast('Commit state restored');
          }
      }, 0);
  }

  function handleKeydown(e: KeyboardEvent) {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key === '1') {
          e.preventDefault();
          activeTab = 'command';
      } else if ((e.ctrlKey || e.metaKey) && e.key === '2') {
          e.preventDefault();
          activeTab = 'ignore';
      } else if ((e.ctrlKey || e.metaKey) && e.key === '3') {
          e.preventDefault();
          activeTab = 'commit';
      } else if ((e.ctrlKey || e.metaKey) && e.key === '4') {
          e.preventDefault();
          activeTab = 'doctor';
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          // It's mostly handled per component but as a fallback
      } else if (e.key === 'Escape') {
          activeTab = 'command';
      }
  }

  onMount(() => {
      window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
      if (typeof window !== 'undefined') {
          window.removeEventListener('keydown', handleKeydown);
      }
  });

  $: breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `https://selfgrowingmicrotool.com/${lang}` },
      { "@type": "ListItem", "position": 2, "name": "Tools", "item": `https://selfgrowingmicrotool.com/${lang}#tools` },
      { "@type": "ListItem", "position": 3, "name": dict?.title || 'Git Forge', "item": `https://selfgrowingmicrotool.com/${lang}/tools/git-forge` }
    ]
  };

  $: softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
        "isAccessibleForFree": true,
    "name": dict?.title || 'Git Forge',
    "description": dict?.description || 'Git tools',
    "applicationCategory": "DeveloperApplication",
    "applicationSubCategory": "Version Control System Tool",
    "operatingSystem": "Any",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "featureList": [
      "Visual Git Command Builder",
      "Gitignore File Generator",
      "Conventional Commits Builder",
      "Git Doctor for undoing mistakes",
      "Git Alias Exporter",
      "Interactive Git Log Visualizer"
    ]
  };

  $: howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to use ${dict?.title || 'Git Forge'}`,
    "step": [
      {
        "@type": "HowToStep",
        "name": "Select Tool",
        "text": "Choose between Command Builder, .gitignore Generator, or Commit Message Builder.",
        "position": 1
      },
      {
        "@type": "HowToStep",
        "name": "Configure",
        "text": "Fill in the required fields or select the necessary options for your task.",
        "position": 2
      },
      {
        "@type": "HowToStep",
        "name": "Copy or Save",
        "text": "Copy the generated output to your clipboard or save it to your history for later use.",
        "position": 3
      }
    ]
  };

  $: faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": dict?.q1 || '',
        "acceptedAnswer": { "@type": "Answer", "text": dict?.a1 || '' }
      },
      {
        "@type": "Question",
        "name": dict?.q2 || '',
        "acceptedAnswer": { "@type": "Answer", "text": dict?.a2 || '' }
      },
      {
        "@type": "Question",
        "name": dict?.q3 || '',
        "acceptedAnswer": { "@type": "Answer", "text": dict?.a3 || '' }
      }
    ]
  };
</script>

<Head
  title={dict?.title || 'Git Forge'}
  description={dict?.description || 'Git tools'}
  keywords="git command generator, gitignore builder, conventional commits, git tools, developer tools, git doctor, undo git commit"
  image="https://selfgrowingmicrotool.com/og/git-forge.png"
  url={`https://selfgrowingmicrotool.com/${lang}/tools/git-forge`}
/>

<svelte:head>
  <link rel="canonical" href="https://selfgrowingmicrotool.com/en/tools/git-forge" />
  <link rel="alternate" hreflang="ko" href="https://selfgrowingmicrotool.com/ko/tools/git-forge" />
  <link rel="alternate" hreflang="en" href="https://selfgrowingmicrotool.com/en/tools/git-forge" />
  <link rel="alternate" hreflang="x-default" href="https://selfgrowingmicrotool.com/en/tools/git-forge" />

  {@html '<script type="application/ld+json">' + JSON.stringify(breadcrumbSchema) + '</script>'}
  {@html '<script type="application/ld+json">' + JSON.stringify(softwareSchema) + '</script>'}
  {@html '<script type="application/ld+json">' + JSON.stringify(howToSchema) + '</script>'}
  {@html '<script type="application/ld+json">' + JSON.stringify(faqSchema) + '</script>'}
</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white pb-20 transition-colors duration-300">
  <!-- Header -->
  <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <a href="/{lang}" aria-label={common.back} class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
          <ChevronLeft size={20} />
        </a>
        <div class="flex items-center space-x-2">
          <div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
             <GitBranch size={20} />
          </div>
          <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400">
            {dict?.title || 'Git Forge'}
          </h1>
        </div>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- Main Tool Area (8 cols) -->
          <div class="lg:col-span-8 space-y-6">

              <!-- Tabs -->
              <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-1.5 flex overflow-x-auto overflow-y-hidden gap-1">
                  <button
                      on:click={() => activeTab = 'command'}
                      class="flex-1 flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] min-w-[44px] rounded-lg text-sm font-medium transition-all {activeTab === 'command' ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 shadow-sm' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}"
                  >
                      <Terminal size={16} />
                      <span class="hidden sm:inline">{dict?.tabs?.command || 'Command Builder'}</span>
                  </button>
                  <button
                      on:click={() => activeTab = 'ignore'}
                      class="flex-1 flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] min-w-[44px] rounded-lg text-sm font-medium transition-all {activeTab === 'ignore' ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 shadow-sm' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}"
                  >
                      <FileCode size={16} />
                      <span class="hidden sm:inline">{dict?.tabs?.ignore || '.gitignore'}</span>
                  </button>
                  <button
                      on:click={() => activeTab = 'commit'}
                      class="flex-1 flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] min-w-[44px] rounded-lg text-sm font-medium transition-all {activeTab === 'commit' ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 shadow-sm' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}"
                  >
                      <MessageSquare size={16} />
                      <span class="hidden sm:inline">{dict?.tabs?.commit || 'Commit Builder'}</span>
                  </button>
                  <button
                      on:click={() => activeTab = 'doctor'}
                      class="flex-1 flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] min-w-[44px] rounded-lg text-sm font-medium transition-all {activeTab === 'doctor' ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 shadow-sm' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}"
                  >
                      <Stethoscope size={16} />
                      <span class="hidden sm:inline">{dict?.tabs?.doctor || 'Git Doctor'}</span>
                  </button>
              </div>

              <!-- Content -->
              <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 min-h-[500px]">
                  {#if activeTab === 'command'}
                      <div transition:fade={{ duration: 200 }}>
                          <CommandBuilder bind:this={commandBuilderComponent} dictionary={dict} on:save={handleSave} on:copy={handleCopy} on:copyAlias={handleCopyAlias} />
                      </div>
                  {:else if activeTab === 'ignore'}
                      <div transition:fade={{ duration: 200 }}>
                          <GitignoreGen bind:this={gitignoreGenComponent} dictionary={dict} on:save={handleSave} on:copy={handleCopy} />
                      </div>
                  {:else if activeTab === 'commit'}
                      <div transition:fade={{ duration: 200 }}>
                          <CommitBuilder bind:this={commitBuilderComponent} dictionary={dict} on:save={handleSave} on:copy={handleCopy} />
                      </div>
                  {:else if activeTab === 'doctor'}
                      <div transition:fade={{ duration: 200 }}>
                          <GitDoctor dictionary={dict} on:save={handleSave} on:copy={handleCopy} />
                      </div>
                  {/if}
              </div>

              <!-- Docs -->
              {#if dict?.guide}
              <div class="mt-12 space-y-8">
                  <GuideSection
                      title={dict?.guide?.title}
                      intro={dict?.guide?.intro}
                      featuresTitle={dict?.guide?.featuresTitle}
                      f1={dict?.guide?.f1}
                      f2={dict?.guide?.f2}
                      f3={dict?.guide?.f3}
                      tipsTitle={dict?.guide?.tipsTitle}
                      tip1={dict?.guide?.tip1}
                      tip2={dict?.guide?.tip2}
                      tip3={dict?.guide?.tip3}
                  />
                  <FAQSection
                      title={dict?.faqTitle}
                      items={[
                          { q: dict?.q1, a: dict?.a1 },
                          { q: dict?.q2, a: dict?.a2 },
                          { q: dict?.q3, a: dict?.a3 }
                      ]}
                  />
              </div>
              {/if}
          </div>

          <!-- Sidebar (4 cols) -->
          <div class="lg:col-span-4 space-y-6">
              <div class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 sticky top-24 h-[600px]">
                  <HistoryPanel dictionary={dict} on:copy={handleCopy} on:restore={handleRestore} />
              </div>
          </div>
      </div>
  </main>

  <!-- Toast -->
  {#if showToast}
    <div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50" transition:fade>
      <div class="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 font-medium text-sm">
        <Check size={18} />
        <span>{toastMessage}</span>
      </div>
    </div>
  {/if}
</div>
