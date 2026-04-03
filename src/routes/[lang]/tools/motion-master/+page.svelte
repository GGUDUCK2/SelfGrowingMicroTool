<script lang="ts">
  import Head from '$lib/components/Head.svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import { animationStore, isPlaying, previewStore } from '$lib/utils/motion-master/store';
  import { generateCSS, generateTailwind } from '$lib/utils/motion-master/generator';
  import { db } from '$lib/db';
  import { presets } from '$lib/utils/motion-master/presets';

  import Stage from '$lib/components/motion-master/Stage.svelte';
  import Timeline from '$lib/components/motion-master/Timeline.svelte';
  import PropertyPanel from '$lib/components/motion-master/PropertyPanel.svelte';
  import HistorySidebar from '$lib/components/motion-master/HistorySidebar.svelte';

  import { Play, Pause, Save, Share2, Code, Menu, X, Settings, RotateCcw } from 'lucide-svelte';
  import { fly, fade } from 'svelte/transition';

  $: lang = $page.params.lang || 'en';
  $: dictionary = getDictionary(lang);
  $: dict = dictionary.tools.motionMaster;

  let showSidebar = false;
  let showCodeModal = false;
  let codeMode: 'css' | 'tailwind' = 'css';
  let generatedCode = '';

  // Presets
  function loadPreset(key: string) {
      if(confirm('Load preset? Current work will be replaced.')) {
          $animationStore = JSON.parse(JSON.stringify(presets[key]));
      }
  }

  // Save
  async function save() {
      await db.motionMasterHistory.add({
          name: $animationStore.name,
          state: JSON.parse(JSON.stringify($animationStore)),
          createdAt: new Date(),
          starred: 0
      });
      alert(dict.saved);
  }

  // Export
  function openExport() {
      codeMode = 'css';
      generatedCode = generateCSS($animationStore);
      showCodeModal = true;
  }

  function switchCodeMode(mode: 'css' | 'tailwind') {
      codeMode = mode;
      generatedCode = mode === 'css' ? generateCSS($animationStore) : generateTailwind($animationStore);
  }

  function copyCode() {
      navigator.clipboard.writeText(generatedCode);
      alert(dict.copied);
  }

  // Shortcuts
  function handleKeydown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
          e.preventDefault();
          $isPlaying = !$isPlaying;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          save();
      }
  }


  $: jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
        "isAccessibleForFree": true,
    "name": dict?.title,
    "description": dict?.description,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Visual Keyframe Timeline",
      "CSS Code Generation",
      "Tailwind Config Export",
      "Real-time Preview"
    ]
  };

  $: jsonLd2 = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": dict?.q1,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict?.a1
        }
      },
      {
        "@type": "Question",
        "name": dict?.q2,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict?.a2
        }
      },
      {
        "@type": "Question",
        "name": dict?.q3,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict?.a3
        }
      }
    ]
  };
</script>
<Head
  title={dict?.title}
  description={dict?.description}
  keywords="css animation, keyframes generator, animation tool, web motion design, tailwind animation"
/>


<svelte:window on:keydown={handleKeydown} />

<svelte:head>


  {@html '<script type="application/ld+json">' + JSON.stringify(jsonLd) + '</script>'}

  {@html '<script type="application/ld+json">' + JSON.stringify(jsonLd2) + '</script>'}

</svelte:head>

<div class="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-slate-900">
   <!-- Sidebar -->
   <div class="fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-slate-800 shadow-xl transform transition-transform duration-300 md:relative md:translate-x-0 md:shadow-none border-r border-slate-200 dark:border-slate-700 {showSidebar ? 'translate-x-0' : '-translate-x-full'} pt-16 md:pt-0">
        <HistorySidebar {dict} onClose={() => showSidebar = false} />
   </div>

   <!-- Backdrop -->
   {#if showSidebar}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="fixed inset-0 bg-black/50 z-40 md:hidden" on:click={() => showSidebar = false} transition:fade></div>
   {/if}

   <!-- Main Content -->
   <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
       <!-- Toolbar -->
       <header class="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 z-20">
           <div class="flex items-center gap-3">
               <button class="md:hidden p-2" on:click={() => showSidebar = true}>
                   <Menu class="w-5 h-5 text-slate-500" />
               </button>
               <h1 class="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 hidden sm:block">
                   {dict?.title.split(':')[0]}
               </h1>
           </div>

           <div class="flex items-center gap-2">
                <!-- Preset Dropdown -->
                <select on:change={(e) => loadPreset(e.currentTarget.value)} class="bg-slate-100 dark:bg-slate-700 border-none rounded-lg text-sm p-2 w-32 hidden sm:block cursor-pointer">
                    <option value="" disabled selected>{dict.presets}</option>
                    {#each Object.keys(presets) as key}
                        <option value={key}>{presets[key].name}</option>
                    {/each}
                </select>

                <div class="h-6 w-px bg-slate-200 dark:bg-slate-600 mx-2 hidden sm:block"></div>

                <button on:click={() => $isPlaying = !$isPlaying} class="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 transition-colors" title={dict.play}>
                    {#if $isPlaying}
                        <Pause class="w-5 h-5" />
                    {:else}
                        <Play class="w-5 h-5" />
                    {/if}
                </button>

                <button on:click={save} class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors min-h-[44px]" title={dict.save}>
                    <Save class="w-5 h-5" />
                </button>

                <button on:click={openExport} class="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium min-h-[44px]">
                    <Code class="w-4 h-4" /> <span class="hidden sm:inline">{dict.export}</span>
                </button>
           </div>
       </header>

       <!-- Workspace -->
       <div class="flex-1 flex flex-col lg:flex-row overflow-hidden">
           <!-- Center: Stage & Timeline -->
           <div class="flex-1 flex flex-col p-4 gap-4 overflow-y-auto lg:overflow-hidden relative">
               <!-- Stage -->
               <div class="flex-1 min-h-[300px] bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative group">
                   <Stage />

                   <!-- Preview Controls -->
                   <div class="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur p-2 rounded-lg shadow border border-slate-200 dark:border-slate-600 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button on:click={() => $previewStore.type = 'box'} class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded" title="Box"><div class="w-4 h-4 bg-indigo-500 rounded"></div></button>
                       <button on:click={() => $previewStore.type = 'circle'} class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded" title="Circle"><div class="w-4 h-4 bg-indigo-500 rounded-full"></div></button>
                       <button on:click={() => $previewStore.type = 'text'} class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded font-bold text-xs flex items-center justify-center w-6 h-6" title="Text">T</button>
                   </div>
               </div>

               <!-- Timeline -->
               <div class="h-48 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col shrink-0">
                   <div class="px-4 py-2 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 uppercase flex justify-between items-center">
                       <span>{dict.timeline}</span>
                       <span class="text-[10px] text-slate-400 font-mono">{$animationStore.duration}ms</span>
                   </div>
                   <div class="flex-1 p-2 relative">
                       <Timeline />
                   </div>
               </div>
           </div>

           <!-- Right: Properties -->
           <div class="w-full lg:w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 overflow-y-auto shrink-0">
               <PropertyPanel {dict} />
           </div>
       </div>
   </div>
</div>

<!-- Modal -->
{#if showCodeModal}
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" transition:fade>
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]" transition:fly={{ y: 20 }}>
            <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h3 class="font-bold text-lg text-slate-800 dark:text-white">{dict.export}</h3>
                <button on:click={() => showCodeModal = false}><X class="w-5 h-5 text-slate-500" /></button>
            </div>
            <div class="flex border-b border-slate-200 dark:border-slate-700">
                <button class="flex-1 py-3 text-sm font-medium {codeMode === 'css' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'} min-h-[44px]" on:click={() => switchCodeMode('css')}>CSS</button>
                <button class="flex-1 py-3 text-sm font-medium {codeMode === 'tailwind' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'} min-h-[44px]" on:click={() => switchCodeMode('tailwind')}>Tailwind</button>
            </div>
            <div class="p-4 flex-1 overflow-hidden relative group">
                <textarea readonly class="w-full h-64 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg font-mono text-xs resize-none focus:outline-none text-slate-700 dark:text-slate-300" value={generatedCode}></textarea>
                <button on:click={copyCode} class="absolute top-6 right-6 px-3 py-1 bg-white dark:bg-slate-800 rounded shadow text-xs font-bold hover:text-indigo-500 border border-slate-200 dark:border-slate-600 min-h-[44px]">
                    {dict.copy}
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- Documentation Section -->
<div class="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
  <div class="max-w-4xl mx-auto px-4 py-12">
    <article class="prose dark:prose-invert max-w-none">
      <h2 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 mb-6">
        {dict?.guide?.title}
      </h2>

      <p class="text-lg text-slate-600 dark:text-slate-400 mb-8">
        {dict?.guide?.intro}
      </p>

      <div class="grid md:grid-cols-2 gap-8 mb-12">
        <div class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl">
          <h3 class="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">{dict?.guide?.featuresTitle}</h3>
          <ul class="space-y-2 text-slate-600 dark:text-slate-400 list-disc list-inside">
            <li>{@html dict?.guide?.f1}</li>
            <li>{@html dict?.guide?.f2}</li>
            <li>{@html dict?.guide?.f3}</li>
          </ul>
        </div>

        <div class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl">
           <h3 class="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">{dict?.guide?.tipsTitle}</h3>
           <ul class="space-y-2 text-slate-600 dark:text-slate-400 list-disc list-inside">
             <li>{@html dict?.guide?.tip1}</li>
             <li>{@html dict?.guide?.tip2}</li>
             <li>{@html dict?.guide?.tip3}</li>
           </ul>
        </div>
      </div>

      <div class="mt-12">
          <h3 class="text-2xl font-bold mb-6 text-slate-800 dark:text-white">{dict.faqTitle}</h3>
          <div class="space-y-6">
              <div>
                  <h4 class="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">{dict?.q1}</h4>
                  <p class="text-slate-600 dark:text-slate-400">{dict?.a1}</p>
              </div>
              <div>
                  <h4 class="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">{dict?.q2}</h4>
                  <p class="text-slate-600 dark:text-slate-400">{dict?.a2}</p>
              </div>
              <div>
                  <h4 class="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">{dict?.q3}</h4>
                  <p class="text-slate-600 dark:text-slate-400">{dict?.a3}</p>
              </div>
          </div>
      </div>

    </article>
  </div>
</div>
