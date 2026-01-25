<script lang="ts">
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import { gridStore } from '$lib/utils/grid-master/store';
  import { gridMasterWorkspace } from '$lib/db/grid-master';
  import GridCanvas from '$lib/components/grid-master/GridCanvas.svelte';
  import Sidebar from '$lib/components/grid-master/Sidebar.svelte';
  import CodePanel from '$lib/components/grid-master/CodePanel.svelte';
  import ProjectList from '$lib/components/grid-master/ProjectList.svelte';
  import { LayoutGrid, Save, RotateCcw, Check, Smartphone, Monitor } from 'lucide-svelte';
  import { fade } from 'svelte/transition';

  $: lang = $page.params.lang || 'en';
  $: dict = (getDictionary(lang) || getDictionary('en')).tools?.gridMaster || getDictionary('en').tools.gridMaster;
  $: common = getDictionary(lang).common;

  let showToast = false;
  let toastMessage = '';
  let projectName = 'My Grid';
  let viewMode: 'desktop' | 'mobile' = 'desktop';

  async function handleSave() {
      if (!projectName.trim()) return;

      await gridMasterWorkspace.save({
          name: projectName,
          ...$gridStore
      });

      showToastMsg(dict.save + ' ' + (dict.copied || 'Saved').replace('!', ''));
  }

  function handleReset() {
      if (confirm('Reset grid?')) {
          gridStore.reset();
      }
  }

  function showToastMsg(msg: string) {
      toastMessage = msg;
      showToast = true;
      setTimeout(() => showToast = false, 2000);
  }
</script>

<svelte:head>
  <title>{dict.title} - MicroFactory</title>
  <meta name="description" content={dict.description} />
  <meta property="og:title" content={dict.title} />
  <meta property="og:description" content={dict.description} />
  <meta property="og:type" content="website" />

  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Grid Master",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": "Visual CSS Grid Editor, Tailwind Code Generator, Layout Prototyping"
    }
  </script>
</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white pb-20">
  <!-- Header -->
  <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <a href="/{lang}" aria-label={common.back} class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </a>
        <div class="flex items-center space-x-2">
          <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
             <LayoutGrid size={20} />
          </div>
          <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 hidden sm:block">
            {dict.title}
          </h1>
        </div>
      </div>

      <div class="flex items-center space-x-3">
           <div class="bg-slate-100 dark:bg-slate-800 rounded-lg p-1 hidden sm:flex">
               <button
                 class="p-1.5 rounded-md transition-all {viewMode === 'desktop' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}"
                 on:click={() => viewMode = 'desktop'}
               >
                   <Monitor size={16} />
               </button>
               <button
                 class="p-1.5 rounded-md transition-all {viewMode === 'mobile' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}"
                 on:click={() => viewMode = 'mobile'}
               >
                   <Smartphone size={16} />
               </button>
           </div>

           <div class="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block"></div>

           <input
             type="text"
             bind:value={projectName}
             class="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none w-32 sm:w-48 text-sm font-medium transition-colors text-right sm:text-left text-slate-700 dark:text-slate-200"
             placeholder="Project Name"
           />

           <button
             class="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
             on:click={handleSave}
             aria-label={dict.save}
           >
              <Save size={18} />
           </button>
           <button
             class="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
             on:click={handleReset}
             aria-label={dict.clear}
           >
              <RotateCcw size={18} />
           </button>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

      <!-- Left Sidebar (Controls) -->
      <div class="lg:col-span-3 space-y-8 order-2 lg:order-1">
          <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
              <Sidebar {dict} />
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
              <ProjectList {dict} />
          </div>
      </div>

      <!-- Main Canvas Area -->
      <div class="lg:col-span-9 space-y-6 order-1 lg:order-2">
          <!-- Canvas Container -->
          <div class="flex justify-center bg-slate-100 dark:bg-black/20 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 min-h-[500px] items-center relative overflow-hidden">
               <!-- Viewport Simulation -->
               <div
                 class="transition-all duration-500 ease-in-out bg-white dark:bg-slate-900 shadow-2xl rounded-xl overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/10"
                 style="width: {viewMode === 'desktop' ? '100%' : '375px'}; height: {viewMode === 'desktop' ? '500px' : '667px'};"
               >
                   <GridCanvas />
               </div>
          </div>

          <!-- Output Code -->
          <div class="h-64">
              <CodePanel {dict} />
          </div>

          <!-- Documentation -->
          <div class="mt-12 prose dark:prose-invert max-w-none">
              <h2 class="text-2xl font-bold">{dict.guide.title}</h2>
              <p>{dict.guide.intro}</p>

              <h3 class="text-xl font-semibold">{dict.guide.featuresTitle}</h3>
              <ul class="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose">
                 <li class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    {@html dict.guide.f1.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-indigo-600 dark:text-indigo-400">$1</span>')}
                 </li>
                 <li class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    {@html dict.guide.f2.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-indigo-600 dark:text-indigo-400">$1</span>')}
                 </li>
                 <li class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    {@html dict.guide.f3.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-indigo-600 dark:text-indigo-400">$1</span>')}
                 </li>
              </ul>

              <h3 class="text-xl font-semibold mt-8">{dict.faqTitle}</h3>
              <div class="grid gap-4 not-prose">
                 <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h4 class="font-semibold text-lg mb-2">{dict.q1}</h4>
                    <p class="text-slate-600 dark:text-slate-400 leading-relaxed">{dict.a1}</p>
                 </div>
                 <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h4 class="font-semibold text-lg mb-2">{dict.q2}</h4>
                    <p class="text-slate-600 dark:text-slate-400 leading-relaxed">{dict.a2}</p>
                 </div>
                 <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h4 class="font-semibold text-lg mb-2">{dict.q3}</h4>
                    <p class="text-slate-600 dark:text-slate-400 leading-relaxed">{dict.a3}</p>
                 </div>
              </div>
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
