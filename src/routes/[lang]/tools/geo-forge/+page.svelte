<script lang="ts">
  import Head from '$lib/components/Head.svelte';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import {
    parseWKT, toWKT, parseCSV, toCSV,
    getConvexHull, getAllPoints, getCentroid, getBBox,
    reverseGeometry, simplifyGeometry, createBuffer, toKML, toGPX
  } from '$lib/utils/geo-forge';
  import type { GeoJSON, Layer } from '$lib/utils/geo-forge/types';
  import { repairWKT } from '$lib/utils/geo-forge/repair';

  import Toolbar from '$lib/components/geo-forge/Toolbar.svelte';
  import StatsPanel from '$lib/components/geo-forge/StatsPanel.svelte';
  import ExampleLoader from '$lib/components/geo-forge/ExampleLoader.svelte';
  import GeoEditor from '$lib/components/geo-forge/GeoEditor.svelte';
  import MapCanvas from '$lib/components/geo-forge/MapCanvas.svelte';
  import Sidebar from '$lib/components/geo-forge/Sidebar.svelte';
  import ExportModal from '$lib/components/geo-forge/ExportModal.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';

  import { db, saveProject, getRecentProjects, type GeoForgeProject } from '$lib/db/geo-forge';
  import { addToHistory } from '$lib/db/workspace';
  import { History, Globe, Code, Save, Clock, Layers, Eye, EyeOff, Plus, Trash2, Box, CircleDot, Maximize, Menu, X, CircleHelp } from 'lucide-svelte';
  import { fade, slide, fly } from 'svelte/transition';
  import { liveQuery } from 'dexie';
  import { v4 as uuidv4 } from 'uuid';

  $: lang = $page.params.lang || 'en';
  $: dictionary = getDictionary(lang);
  $: dict = dictionary?.tools?.geoForge || {
     title: "Geo Forge",
     description: "The definitive geospatial toolkit.",
     guide: {}
  };

  let activeTab = 'map'; // map | data

  // Layer System
  let layers: Layer[] = [];
  let activeLayerId: string | null = null;

  // Initialize with one empty layer
  onMount(() => {
      addLayer('Layer 1');
  });

  function addLayer(name: string, data: GeoJSON | null = null, fmt: 'wkt' | 'geojson' | 'csv' = 'wkt') {
      const id = uuidv4();
      const color = getRandomColor();
      layers = [...layers, {
          id,
          name,
          data,
          visible: true,
          color,
          format: fmt
      }];
      activeLayerId = id;
  }

  function removeLayer(id: string) {
      layers = layers.filter(l => l.id !== id);
      if (activeLayerId === id) {
          activeLayerId = layers.length > 0 ? layers[0].id : null;
      }
  }

  function toggleLayer(id: string) {
      layers = layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l);
  }

  function getRandomColor() {
      const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
      return colors[Math.floor(Math.random() * colors.length)];
  }

  async function logOp(action: string, layerName: string, data: GeoJSON) {
      await addToHistory('geo-forge', action, {
          name: layerName,
          data,
          format: 'wkt'
      });
  }

  // Derived state for Editor
  $: activeLayer = layers.find(l => l.id === activeLayerId);
  $: input = activeLayer && activeLayer.data ? toWKT(activeLayer.data) : ''; // Default to WKT for view
  $: format = activeLayer?.format || 'wkt';
  $: geo = activeLayer?.data || null;

  let error = '';
  let showHistory = false;
  let showMobileMenu = false;
  let showExportModal = false;
  let showHelp = false;
  let mapCanvas: MapCanvas;
  let mode: 'view' | 'draw_point' | 'draw_line' | 'draw_poly' | 'draw_ruler' = 'view';

  // Recent History
  let historyItems = liveQuery(() => getRecentProjects(5));

  // Auto-save debounce
  let saveTimer: NodeJS.Timeout;
  $: if (activeLayer && activeLayer.data) {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(async () => {
          let preview: string | undefined;
          if (mapCanvas) {
              preview = await mapCanvas.getSnapshot();
          }
          saveProject(activeLayer!.name || 'AutoSave', toWKT(activeLayer!.data!), 'wkt', preview);
      }, 5000);
  }

  function handleLoadProject(p: GeoForgeProject) {
      try {
          let g: GeoJSON;
          if (p.format === 'geojson') g = JSON.parse(p.data);
          else if (p.format === 'csv') g = parseCSV(p.data);
          else g = parseWKT(p.data);

          addLayer(p.name, g);
          showHistory = false;
          activeTab = 'map';
      } catch (e) {
          alert('Failed to load project: ' + e);
      }
  }

  function updateActiveLayerData(newData: string, newFormat: 'wkt' | 'geojson' | 'csv') {
      if (!activeLayerId) return;

      try {
            let newGeo: GeoJSON | null = null;
            if (newData.trim()) {
                if (newFormat === 'wkt') {
                    newGeo = parseWKT(newData);
                } else if (newFormat === 'csv') {
                    newGeo = parseCSV(newData);
                } else {
                    newGeo = JSON.parse(newData);
                }
            }

            layers = layers.map(l => l.id === activeLayerId ? { ...l, data: newGeo, format: newFormat } : l);
            error = '';
        } catch (e: unknown) {
            if (e instanceof Error) {
                error = e.message;
            } else {
                error = String(e);
            }
        }
  }

  let editorValue = '';
  let editorFormat: 'wkt' | 'geojson' | 'csv' = 'wkt';

  let lastActiveId: string | null = null;
  $: if (activeLayerId !== lastActiveId) {
      if (activeLayer) {
          try {
             if (activeLayer.format === 'wkt') editorValue = activeLayer.data ? toWKT(activeLayer.data) : '';
             else if (activeLayer.format === 'csv') editorValue = activeLayer.data ? toCSV(activeLayer.data) : '';
             else editorValue = activeLayer.data ? JSON.stringify(activeLayer.data, null, 2) : '';
             editorFormat = activeLayer.format;
          } catch(e) { console.error(e); }
      } else {
          editorValue = '';
      }
      lastActiveId = activeLayerId;
  }

  let lastData: GeoJSON | null = null;
  $: if (activeLayer && activeLayer.data !== lastData) {
      lastData = activeLayer.data;
      try {
         if (editorFormat === 'wkt') editorValue = activeLayer.data ? toWKT(activeLayer.data) : '';
         else if (editorFormat === 'csv') editorValue = activeLayer.data ? toCSV(activeLayer.data) : '';
         else editorValue = activeLayer.data ? JSON.stringify(activeLayer.data, null, 2) : '';
      } catch(e) {}
  }

  $: {
      if (activeLayerId && (editorValue !== (lastData ? (editorFormat === 'wkt' ? toWKT(lastData) : JSON.stringify(lastData)) : ''))) {
          updateActiveLayerData(editorValue, editorFormat);
      }
  }

  function handleLoadExample(e: CustomEvent<string>) {
      addLayer("Example " + (layers.length + 1), parseWKT(e.detail));
  }

  function handleConvert(target: 'wkt' | 'geojson' | 'csv') {
      if (!activeLayer || !activeLayer.data) return;
      try {
          editorFormat = target;
          if (target === 'wkt') editorValue = toWKT(activeLayer.data);
          else if (target === 'csv') editorValue = toCSV(activeLayer.data);
          else editorValue = JSON.stringify(activeLayer.data, null, 2);

          layers = layers.map(l => l.id === activeLayerId ? { ...l, format: target } : l);
      } catch (e: unknown) {
          alert("Conversion failed: " + e);
      }
  }

  function handleSimplify() {
      if (!activeLayer || !activeLayer.data) return;
      const toleranceStr = prompt(dict?.prompt_tolerance || "Enter simplification tolerance (degrees, e.g. 0.001):", "0.001");
      if (!toleranceStr) return;
      const tolerance = parseFloat(toleranceStr);
      if (isNaN(tolerance)) return;

      try {
          const simplified = simplifyGeometry(activeLayer.data, tolerance);
          const newName = activeLayer.name + " (Simplified)";
          addLayer(newName, simplified);
          logOp("Simplify", newName, simplified);
      } catch (e) {
          alert("Simplify failed: " + e);
      }
  }

  function handleBuffer() {
      if (!activeLayer || !activeLayer.data) return;

      const type = activeLayer.data.type;
      const isSupported = type === 'Point' || type === 'MultiPoint' ||
                          (type === 'Feature' && activeLayer.data.geometry.type === 'Point') ||
                          type === 'FeatureCollection';

      if (!isSupported) {
          if (!confirm("Warning: Exact buffering for Lines/Polygons is not yet supported. Only Points will be buffered. Continue?")) {
              return;
          }
      }

      const distStr = prompt(dict?.prompt_buffer || "Enter buffer radius in meters:", "1000");
      if (!distStr) return;
      const dist = parseFloat(distStr);
      if (isNaN(dist)) return;

      try {
          const buffered = createBuffer(activeLayer.data, dist);
          const newName = activeLayer.name + " (Buffer)";
          addLayer(newName, buffered);
          logOp("Buffer", newName, buffered);
      } catch (e) {
          alert("Buffer failed: " + e);
      }
  }

  function handleConvexHull() {
      if (!activeLayer || !activeLayer.data) return;
      const points = getAllPoints(activeLayer.data);
      const hull = getConvexHull(points);
      hull.push(hull[0]);

      const poly: GeoJSON = {
          type: 'Polygon',
          coordinates: [hull]
      };
      const newName = activeLayer.name + " (Hull)";
      addLayer(newName, poly);
      logOp("Convex Hull", newName, poly);
  }

  function handleBBox() {
       if (!activeLayer || !activeLayer.data) return;
       const bbox = getBBox(activeLayer.data);
       const poly: GeoJSON = {
           type: 'Polygon',
           coordinates: [[
               [bbox[0], bbox[1]],
               [bbox[2], bbox[1]],
               [bbox[2], bbox[3]],
               [bbox[0], bbox[3]],
               [bbox[0], bbox[1]]
           ]]
       };
       const newName = activeLayer.name + " (Bounds)";
       addLayer(newName, poly);
       logOp("Bounding Box", newName, poly);
  }

  function handleReverse() {
      if (!activeLayer || !activeLayer.data) return;
      try {
          const reversed = reverseGeometry(activeLayer.data);
          layers = layers.map(l => l.id === activeLayerId ? { ...l, data: reversed } : l);
          logOp("Reverse Geometry", activeLayer.name, reversed);
      } catch (e) {
          alert("Reverse failed: " + e);
      }
  }

  function handleClear() {
      if (activeLayerId) {
          layers = layers.map(l => l.id === activeLayerId ? { ...l, data: null } : l);
      }
  }

  function handleCopy() {
      navigator.clipboard.writeText(editorValue);
  }

  async function handleSaveManual() {
     const name = prompt("Project Name:", activeLayer?.name || "My Geometry");
     if (name && activeLayer && activeLayer.data) {
         let preview: string | undefined;
         if (mapCanvas) {
             preview = await mapCanvas.getSnapshot();
         }
         saveProject(name, toWKT(activeLayer.data), 'wkt', preview);
     }
  }

  function handleDownload() {
      if (!activeLayer || !activeLayer.data) return;
      showExportModal = true;
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
      if (editorFormat === 'wkt') {
          const repaired = repairWKT(editorValue);
          if (repaired !== editorValue) {
              editorValue = repaired;
              updateActiveLayerData(editorValue, 'wkt');
          } else {
              alert("No repairs needed or could not repair.");
          }
      } else {
          alert("Repair only available for WKT.");
      }
  }

  function handleDraw(e: CustomEvent<GeoJSON>) {
      const type = e.detail.type;
      addLayer(`Drawn ${type}`, e.detail);
      mode = 'view';
      logOp(`Draw ${type}`, `Drawn ${type}`, e.detail);
  }

  // FAQ
  $: faqItems = [
      { q: dict?.q1 || "What is WKT?", a: dict?.a1 || "Well-Known Text (WKT) is a text markup language for representing vector geometry objects." },
      { q: dict?.q2 || "How is area calculated?", a: dict?.a2 || "We use the Shoelace formula adapted for spherical coordinates (Geodesic area)." },
      { q: dict?.q3 || "Can I use this offline?", a: dict?.a3 || "Yes! Geo Forge runs entirely on your device." }
  ];

  $: faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };
</script>
<Head
  title={dict?.title}
  description={dict?.description}
  keywords="geojson, wkt, csv, map, converter, geospatial, gis tools, visualization, coordinates"
/>


<svelte:head>


  {@html `<script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
        "isAccessibleForFree": true,
      "name": "${dict?.title}",
      "description": "${dict?.description}",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "WKT/GeoJSON/CSV/KML/GPX Converter",
        "Multi-layer Visualization",
        "Convex Hull & Buffer Generator",
        "Geometry Simplification",
        "Client-side Privacy",
        "Interactive Drawing"
      ]
    }
  </script>`}
  {@html '<script type="application/ld+json">' + JSON.stringify(faqSchema) + '</script>'}
</svelte:head>

<div class="h-[calc(100vh-64px)] flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden">
  <!-- Header / Toolbar -->
  <div class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex flex-col md:flex-row gap-4 items-center justify-between shrink-0 z-20 shadow-sm">
     <div class="flex items-center gap-3 w-full md:w-auto">
         <!-- Mobile Menu Toggle -->
         <button
            class="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            on:click={() => showMobileMenu = true}
            aria-label="Open Menu"
         >
            <Menu class="w-6 h-6" />
         </button>

         <div class="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-200 dark:shadow-none">
             <Globe class="w-6 h-6" />
         </div>
         <div>
             <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                {dict?.title}
             </h1>
             <p class="text-xs text-slate-500 hidden sm:block">Professional Geospatial Toolkit</p>
         </div>
     </div>

     <div class="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar">
         <button
            class="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium min-h-[44px]"
            on:click={() => showHistory = !showHistory}
            aria-label="Toggle history"
         >
            <Clock class="w-4 h-4" />
            <span class="hidden sm:inline">Recent</span>
         </button>
         <button
            class="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors text-sm font-medium min-h-[44px]"
            on:click={handleSaveManual}
            aria-label="Save project"
         >
            <Save class="w-4 h-4" />
            <span class="hidden sm:inline">Save</span>
         </button>

         <div class="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

         <ExampleLoader {dict} on:load={handleLoadExample} />

         <div class="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

         <div class="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg">
             <button
                class="px-3 py-1.5 rounded-md text-sm font-medium transition-all {activeTab === 'map' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'} min-h-[44px]"
                on:click={() => activeTab = 'map'}
                aria-label="Switch to map view"
             >
                Map View
             </button>
             <button
                class="px-3 py-1.5 rounded-md text-sm font-medium transition-all {activeTab === 'data' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'} min-h-[44px]"
                on:click={() => activeTab = 'data'}
                aria-label="Switch to data editor"
             >
                Data Editor
             </button>
         </div>

         <!-- Help Button -->
         <button
            class="ml-2 p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors min-h-[44px]"
            on:click={() => showHelp = true}
            aria-label="Help & FAQ"
         >
            <CircleHelp class="w-5 h-5" />
         </button>
     </div>
  </div>

  <!-- Main Workspace -->
  <div class="flex-1 flex overflow-hidden">
      <!-- Desktop Sidebar -->
      <div class="hidden lg:block w-80 h-full">
         <Sidebar
            {layers}
            {activeLayerId}
            {activeLayer}
            {editorFormat}
            {dict}
            on:addLayer={(e) => {
                if (typeof e.detail === 'object' && e.detail !== null) {
                    addLayer(e.detail.name || 'Restored', e.detail.data, e.detail.format || 'wkt');
                } else {
                    addLayer(e.detail || `Layer ${layers.length + 1}`);
                }
            }}
            on:setActiveLayer={(e) => activeLayerId = e.detail}
            on:toggleLayer={(e) => toggleLayer(e.detail)}
            on:removeLayer={(e) => removeLayer(e.detail)}
            on:convexHull={handleConvexHull}
            on:bbox={handleBBox}
            on:convert={(e) => handleConvert(e.detail)}
         />
      </div>

      <!-- Mobile Sidebar Drawer -->
      {#if showMobileMenu}
        <div class="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
            <button
              class="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default min-h-[44px]"
              on:click={() => showMobileMenu = false}
              on:keydown={(e) => e.key === 'Escape' && (showMobileMenu = false)}
              transition:fade
              aria-label="Close menu"
            ></button>
            <div
              class="relative w-80 max-w-[85%] h-full bg-white dark:bg-slate-800 shadow-2xl flex flex-col pointer-events-auto"
              transition:fly={{x: -300, duration: 300}}
            >
                 <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                     <h2 class="font-bold text-lg">Menu</h2>
                     <button class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full min-h-[44px]" on:click={() => showMobileMenu = false} aria-label="Close Menu">
                         <X class="w-5 h-5" />
                     </button>
                 </div>
                 <div class="flex-1 overflow-hidden">
                     <Sidebar
                        {layers}
                        {activeLayerId}
                        {activeLayer}
                        {editorFormat}
                        {dict}
                        on:addLayer={(e) => {
                             if (typeof e.detail === 'object' && e.detail !== null) {
                                addLayer(e.detail.name || 'Restored', e.detail.data, e.detail.format || 'wkt');
                             } else {
                                addLayer(e.detail || `Layer ${layers.length + 1}`);
                             }
                             showMobileMenu = false;
                        }}
                        on:setActiveLayer={(e) => { activeLayerId = e.detail; showMobileMenu = false; }}
                        on:toggleLayer={(e) => toggleLayer(e.detail)}
                        on:removeLayer={(e) => removeLayer(e.detail)}
                        on:convexHull={() => { handleConvexHull(); showMobileMenu = false; }}
                        on:bbox={() => { handleBBox(); showMobileMenu = false; }}
                        on:convert={(e) => { handleConvert(e.detail); showMobileMenu = false; }}
                     />
                 </div>
            </div>
        </div>
      {/if}

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
                    on:buffer={handleBuffer}
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
                          <button class="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm flex gap-3 items-center min-h-[44px]" on:click={() => handleLoadProject(item)}>
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
                  <MapCanvas
                      bind:this={mapCanvas}
                      {layers}
                      {activeLayerId}
                      {dict}
                      bind:mode
                      on:draw={handleDraw}
                  />

                  <!-- Mobile Stats Overlay (Bottom) -->
                  <div class="lg:hidden absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 max-h-[40%] overflow-y-auto z-20">
                      <StatsPanel geo={activeLayer?.data || null} {dict} columns={2} />
                  </div>
              {:else}
                  <div class="h-full flex flex-col p-4">
                      <div class="flex justify-between items-center mb-2 px-1">
                         <div class="flex items-center gap-2">
                             <div class="w-3 h-3 rounded-full" style="background-color: {activeLayer?.color}"></div>
                             <span class="text-xs font-bold uppercase text-slate-500">
                                 {activeLayer?.name || 'No Layer'} ({editorFormat})
                             </span>
                         </div>
                         {#if error}
                            <div class="flex items-center gap-2">
                                <span class="text-xs text-red-500 font-bold">{error}</span>
                                {#if editorFormat === 'wkt'}
                                    <button class="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded hover:bg-red-200 min-h-[44px]" on:click={handleRepair}>Auto-Repair</button>
                                {/if}
                            </div>
                         {/if}
                      </div>
                      <div class="flex-1 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                          <GeoEditor bind:value={editorValue} bind:format={editorFormat} />
                      </div>
                  </div>
              {/if}
          </div>
      </div>
  </div>

  <!-- Help / FAQ Modal -->
  {#if showHelp}
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <button class="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default min-h-[44px]" on:click={() => showHelp = false} on:keydown={(e) => e.key === 'Escape' && (showHelp = false)} transition:fade aria-label="Close help"></button>
          <div class="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl z-10 pointer-events-auto" transition:fly={{y: 20}}>
               <button class="absolute top-4 right-4 p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full z-10 min-h-[44px]" on:click={() => showHelp = false} aria-label="Close Help">
                   <X class="w-6 h-6" />
               </button>
               <div class="p-1">
                  {#if dict?.guide && dict?.guide?.title}
                    <div class="px-6 pt-6">
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
                    </div>
                  {/if}
                  <FAQSection title={dict.faqTitle} items={faqItems} injectSchema={false} />
               </div>
          </div>
      </div>
  {/if}

  <!-- Export Modal -->
  {#if showExportModal && activeLayer}
      <ExportModal
        data={activeLayer.data}
        name={activeLayer.name}
        initialFormat={editorFormat}
        on:close={() => showExportModal = false}
      />
  {/if}
</div>
