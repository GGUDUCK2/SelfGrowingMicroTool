<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import {
    parseWKT, toWKT, parseCSV, toCSV,
    type GeoJSON
  } from '$lib/utils/geo-forge';
  import { repairWKT } from '$lib/utils/geo-forge/repair';

  import Toolbar from '$lib/components/geo-forge/Toolbar.svelte';
  import StatsPanel from '$lib/components/geo-forge/StatsPanel.svelte';
  import ExampleLoader from '$lib/components/geo-forge/ExampleLoader.svelte';
  import GeoEditor from '$lib/components/geo-forge/GeoEditor.svelte';
  import MapCanvas from '$lib/components/geo-forge/MapCanvas.svelte';

  import { db, saveProject, getRecentProjects, type GeoForgeProject } from '$lib/db/geo-forge';
  import { History, Globe, Code, Save, Clock } from 'lucide-svelte';
  import { fade, slide } from 'svelte/transition';
  import { liveQuery } from 'dexie';

  $: lang = $page.params.lang || 'en';
  $: dictionary = getDictionary(lang);
  $: dict = dictionary?.tools?.geoForge || {
     title: "Geo Forge",
     description: "The definitive geospatial toolkit.",
     guide: {}
  };

  let activeTab = 'map'; // map | data
  let input = '';
  let format: 'wkt' | 'geojson' | 'csv' = 'wkt';
  let geo: GeoJSON | null = null;
  let error = '';
  let showHistory = false;
  let mapCanvas: MapCanvas; // Reference to MapCanvas

  // Recent History
  let historyItems = liveQuery(() => getRecentProjects(5));

  // Auto-save debounce
  let saveTimer: NodeJS.Timeout;
  $: if (input && !error && geo) {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(async () => {
          let preview: string | undefined;
          if (mapCanvas) {
              preview = await mapCanvas.getSnapshot();
          }
          saveProject('AutoSave', input, format, preview);
      }, 5000);
  }

  function handleLoadProject(p: GeoForgeProject) {
      input = p.data;
      format = p.format;
      activeTab = 'map';
      showHistory = false;
  }

  // Reactive Parsing
  $: {
    if (input.trim()) {
        try {
            if (format === 'wkt') {
                geo = parseWKT(input);
            } else if (format === 'csv') {
                geo = parseCSV(input);
            } else {
                geo = JSON.parse(input);
            }
            error = '';
        } catch (e: unknown) {
            if (e instanceof Error) {
                error = e.message;
            } else {
                error = String(e);
            }
        }
    } else {
        geo = null;
        error = '';
    }
  }

  function handleLoadExample(e: CustomEvent<string>) {
      input = e.detail;
      format = 'wkt';
      activeTab = 'map';
  }

  function handleConvert(target: string) {
      if (!geo) return;
      try {
          if (target === 'wkt') {
              input = toWKT(geo);
              format = 'wkt';
          } else if (target === 'csv') {
              input = toCSV(geo);
              format = 'csv';
          } else if (target === 'geojson') {
              input = JSON.stringify(geo, null, 2);
              format = 'geojson';
          }
      } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          alert("Conversion failed: " + msg);
      }
  }

  function handleSimplify() {
      // Simplification logic...
      alert("Simplify is currently available for raw LineStrings in pro version.");
  }

  function handleReverse() {
      alert("Feature coming soon!");
  }

  function handleClear() {
      input = '';
      geo = null;
  }

  function handleCopy() {
      navigator.clipboard.writeText(input);
  }

  async function handleSaveManual() {
     const name = prompt("Project Name:", "My Geometry");
     if (name) {
         let preview: string | undefined;
         if (mapCanvas) {
             preview = await mapCanvas.getSnapshot();
         }
         saveProject(name, input, format, preview);
     }
  }

  function handleDownload() {
      const blob = new Blob([input], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `geoforge.${format === 'wkt' ? 'txt' : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  }

  async function handleSnapshot() {
      if (mapCanvas) {
          const dataUrl = await mapCanvas.getSnapshot();
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = 'geoforge-map.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
      }
  }

  function handleRepair() {
      if (format === 'wkt') {
          const repaired = repairWKT(input);
          if (repaired !== input) {
              input = repaired;
              // alert("Repaired WKT!");
          } else {
              alert("No repairs needed or could not repair.");
          }
      } else {
          alert("Repair only available for WKT.");
      }
  }
</script>

<svelte:head>
  <title>{dict.title} | MicroFactory</title>
  <meta name="description" content={dict.description} />
  <meta name="keywords" content="geojson, wkt, csv, map, converter, geospatial, gis tools, visualization, coordinates" />

  <meta property="og:title" content={dict.title} />
  <meta property="og:description" content={dict.description} />
  <meta property="og:type" content="website" />

  {@html `<script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "${dict.title}",
      "description": "${dict.description}",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "WKT to GeoJSON Converter",
        "CSV Mapping",
        "Web Mercator Visualization",
        "Area and Distance Calculation",
        "Client-side Privacy"
      ]
    }
  </script>`}
</svelte:head>

<div class="h-[calc(100vh-64px)] flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden">
  <!-- Header / Toolbar -->
  <div class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex flex-col md:flex-row gap-4 items-center justify-between shrink-0 z-20 shadow-sm">
     <div class="flex items-center gap-3 w-full md:w-auto">
         <div class="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-200 dark:shadow-none">
             <Globe class="w-6 h-6" />
         </div>
         <div>
             <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                {dict.title}
             </h1>
             <p class="text-xs text-slate-500 hidden sm:block">Professional Geospatial Toolkit</p>
         </div>
     </div>

     <div class="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar">
         <button
            class="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium"
            on:click={() => showHistory = !showHistory}
         >
            <Clock class="w-4 h-4" />
            <span class="hidden sm:inline">Recent</span>
         </button>
         <button
            class="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors text-sm font-medium"
            on:click={handleSaveManual}
         >
            <Save class="w-4 h-4" />
            <span class="hidden sm:inline">Save</span>
         </button>

         <div class="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

         <ExampleLoader {dict} on:load={handleLoadExample} />

         <div class="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

         <div class="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg">
             <button
                class="px-3 py-1.5 rounded-md text-sm font-medium transition-all {activeTab === 'map' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'}"
                on:click={() => activeTab = 'map'}
             >
                Map View
             </button>
             <button
                class="px-3 py-1.5 rounded-md text-sm font-medium transition-all {activeTab === 'data' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'}"
                on:click={() => activeTab = 'data'}
             >
                Data Editor
             </button>
         </div>
     </div>
  </div>

  <!-- Main Workspace -->
  <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar (Stats) - Desktop -->
      <div class="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 hidden lg:flex flex-col overflow-y-auto">
          <div class="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 class="font-bold text-slate-800 dark:text-white mb-2">Geometry Stats</h3>
              <StatsPanel {geo} {dict} columns={1} />
          </div>

          <div class="p-4 flex-1">
              <h3 class="font-bold text-slate-800 dark:text-white mb-4">Format Converter</h3>
              <div class="grid grid-cols-1 gap-2">
                  <button class="w-full py-2 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-left text-sm font-medium transition-colors {format === 'wkt' ? 'ring-2 ring-indigo-500' : ''}" on:click={() => handleConvert('wkt')}>
                      Convert to WKT
                  </button>
                  <button class="w-full py-2 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-left text-sm font-medium transition-colors {format === 'geojson' ? 'ring-2 ring-indigo-500' : ''}" on:click={() => handleConvert('geojson')}>
                      Convert to GeoJSON
                  </button>
                  <button class="w-full py-2 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-left text-sm font-medium transition-colors {format === 'csv' ? 'ring-2 ring-indigo-500' : ''}" on:click={() => handleConvert('csv')}>
                      Convert to CSV
                  </button>
              </div>

              <div class="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                  <h4 class="text-sm font-bold text-indigo-800 dark:text-indigo-300 mb-2">Did you know?</h4>
                  <p class="text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed">
                      WKT (Well-Known Text) is a text markup language for representing vector geometry objects. It's widely used in SQL databases like PostGIS.
                  </p>
              </div>
          </div>
      </div>

      <!-- Center Content -->
      <div class="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-900 relative">
          <!-- Toolbar Overlay -->
          <div class="absolute top-4 left-4 right-4 z-10 flex justify-center pointer-events-none">
              <div class="bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 pointer-events-auto">
                  <Toolbar
                    {dict}
                    on:copy={handleCopy}
                    on:download={handleDownload}
                    on:clear={handleClear}
                    on:simplify={handleSimplify}
                    on:reverse={handleReverse}
                    on:snapshot={handleSnapshot}
                    on:repair={handleRepair}
                  />
              </div>
          </div>

          <!-- History Overlay -->
          {#if showHistory}
              <div class="absolute top-20 right-4 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-30 p-2" transition:slide>
                  <div class="px-2 py-1 mb-2 border-b border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-500 uppercase">Recent Projects</div>
                  {#if $historyItems && $historyItems.length > 0}
                      {#each $historyItems as item}
                          <button class="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm flex gap-3 items-center" on:click={() => handleLoadProject(item)}>
                              {#if item.preview}
                                  <img src={item.preview} alt="Preview" class="w-10 h-10 object-cover rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-600" />
                              {:else}
                                  <div class="w-10 h-10 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 flex items-center justify-center">
                                      <Globe class="w-5 h-5 text-slate-400" />
                                  </div>
                              {/if}
                              <div class="overflow-hidden">
                                  <div class="font-medium text-slate-800 dark:text-slate-200 truncate">{item.name}</div>
                                  <div class="text-xs text-slate-500">{new Date(item.updatedAt).toLocaleTimeString()} · {item.format}</div>
                              </div>
                          </button>
                      {/each}
                  {:else}
                      <div class="p-4 text-center text-sm text-slate-500">No history yet.</div>
                  {/if}
              </div>
          {/if}

          <!-- Tab Content -->
          <div class="flex-1 overflow-hidden relative">
              {#if activeTab === 'map'}
                  <MapCanvas bind:this={mapCanvas} {geo} {dict} />

                  <!-- Mobile Stats Overlay -->
                  <div class="lg:hidden absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 max-h-[40%] overflow-y-auto">
                      <StatsPanel {geo} {dict} columns={2} />
                  </div>
              {:else}
                  <div class="h-full flex flex-col p-4">
                      <div class="flex justify-between items-center mb-2 px-1">
                         <span class="text-xs font-bold uppercase text-slate-500">Input Data ({format})</span>
                         {#if error}
                            <div class="flex items-center gap-2">
                                <span class="text-xs text-red-500 font-bold">{error}</span>
                                {#if format === 'wkt'}
                                    <button class="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded hover:bg-red-200" on:click={handleRepair}>Auto-Repair</button>
                                {/if}
                            </div>
                         {/if}
                      </div>
                      <div class="flex-1 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                          <GeoEditor bind:value={input} bind:format />
                      </div>
                  </div>
              {/if}
          </div>
      </div>
  </div>
</div>
