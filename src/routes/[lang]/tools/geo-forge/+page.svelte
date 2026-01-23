<script lang="ts">
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

  import { db, saveProject, getRecentProjects, type GeoForgeProject } from '$lib/db/geo-forge';
  import { History, Globe, Code, Save, Clock, Layers, Eye, EyeOff, Plus, Trash2, Box, CircleDot, Maximize } from 'lucide-svelte';
  import { fade, slide } from 'svelte/transition';
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

  function addLayer(name: string, data: GeoJSON | null = null) {
      const id = uuidv4();
      const color = getRandomColor();
      layers = [...layers, {
          id,
          name,
          data,
          visible: true,
          color,
          format: 'wkt'
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

  // Derived state for Editor
  $: activeLayer = layers.find(l => l.id === activeLayerId);
  $: input = activeLayer && activeLayer.data ? toWKT(activeLayer.data) : ''; // Default to WKT for view
  $: format = activeLayer?.format || 'wkt';
  $: geo = activeLayer?.data || null;

  let error = '';
  let showHistory = false;
  let mapCanvas: MapCanvas;
  let mode: 'view' | 'draw_point' | 'draw_line' | 'draw_poly' = 'view';

  // Recent History
  let historyItems = liveQuery(() => getRecentProjects(5));

  // Auto-save debounce
  // Only save the active layer? Or the whole project?
  // For now, let's keep the existing logic but save the active layer's data
  let saveTimer: NodeJS.Timeout;
  $: if (activeLayer && activeLayer.data) {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(async () => {
          let preview: string | undefined;
          if (mapCanvas) {
              preview = await mapCanvas.getSnapshot();
          }
          // We save the active layer content to history for quick restore
          saveProject(activeLayer!.name || 'AutoSave', toWKT(activeLayer!.data!), 'wkt', preview);
      }, 5000);
  }

  function handleLoadProject(p: GeoForgeProject) {
      // Create a new layer with this data
      try {
          const loadedGeo = parseWKT(p.data); // Assuming saved as WKT for uniformity or using p.format
          // Actually parse based on format
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

  // Reactive Parsing (When typing in Editor)
  // This needs to update the active layer
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

  // Watch for input changes from Editor (bidirectional binding is tricky with derived)
  // We will handle changes via `GeoEditor` events or binding to a local var that updates layer
  // But GeoEditor binds `value` and `format`.
  let editorValue = '';
  let editorFormat: 'wkt' | 'geojson' | 'csv' = 'wkt';

  // Sync Layer -> Editor
  $: if (activeLayer && activeLayerId) {
      // Avoid circular update loops
      // We only update editor if active layer changed completely (e.g. switched layer)
      // or if it was modified externally (e.g. drawing)
      // Determining "source" of change is hard.
      // Let's use a key or timestamp?
      // Or just re-generate string when layer ID changes.
  }

  // Let's simplify: activeLayer is the source of truth.
  // When activeLayerId changes, we load editorValue.
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

  // When drawing updates the layer, we also need to update editorValue
  // The `layers` array is updated. We need to detect if data changed for active layer.
  // This is handled by the reactivity block above? No, only on ID change.
  // We need to watch `activeLayer.data`.
  let lastData: GeoJSON | null = null;
  $: if (activeLayer && activeLayer.data !== lastData) {
      lastData = activeLayer.data;
      // Regenerate editor string
      try {
         if (editorFormat === 'wkt') editorValue = activeLayer.data ? toWKT(activeLayer.data) : '';
         else if (editorFormat === 'csv') editorValue = activeLayer.data ? toCSV(activeLayer.data) : '';
         else editorValue = activeLayer.data ? JSON.stringify(activeLayer.data, null, 2) : '';
      } catch(e) {}
  }

  // When Editor updates
  function handleEditorChange(e: CustomEvent<{ value: string, format: string }>) {
      // Debounce?
      // GeoEditor binds variables. We can watch `editorValue` and `editorFormat`.
  }

  // Watch editorValue/Format
  $: {
      if (activeLayerId && (editorValue !== (lastData ? (editorFormat === 'wkt' ? toWKT(lastData) : JSON.stringify(lastData)) : ''))) {
          // This check is flawed because of formatting differences.
          // Let's just try to parse if valid and update layer.
          // But parsing is heavy.
          // Let's rely on `GeoEditor` binding.
          updateActiveLayerData(editorValue, editorFormat);
      }
  }

  function handleLoadExample(e: CustomEvent<string>) {
      addLayer("Example " + (layers.length + 1), parseWKT(e.detail));
  }

  function handleConvert(target: 'wkt' | 'geojson' | 'csv') {
      if (!activeLayer || !activeLayer.data) return;
      try {
          // Just change the format preference and update text
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
          addLayer(activeLayer.name + " (Simplified)", simplified);
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
          addLayer(activeLayer.name + " (Buffer)", buffered);
      } catch (e) {
          alert("Buffer failed: " + e);
      }
  }

  function handleConvexHull() {
      if (!activeLayer || !activeLayer.data) return;
      const points = getAllPoints(activeLayer.data);
      const hull = getConvexHull(points);
      // Close it
      hull.push(hull[0]);

      addLayer(activeLayer.name + " (Hull)", {
          type: 'Polygon',
          coordinates: [hull]
      });
  }

  function handleBBox() {
       if (!activeLayer || !activeLayer.data) return;
       const bbox = getBBox(activeLayer.data); // [minX, minY, maxX, maxY]
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
       addLayer(activeLayer.name + " (Bounds)", poly);
  }

  function handleReverse() {
      if (!activeLayer || !activeLayer.data) return;
      try {
          const reversed = reverseGeometry(activeLayer.data);
          // Update directly
          layers = layers.map(l => l.id === activeLayerId ? { ...l, data: reversed } : l);
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

      const formats = ['wkt', 'geojson', 'csv', 'kml', 'gpx'];
      const choice = prompt((dict?.prompt_format || "Enter format to download") + ` (${formats.join(', ')}):`, editorFormat);
      if (!choice || !formats.includes(choice.toLowerCase())) return;

      const fmt = choice.toLowerCase();
      let content = '';
      let ext = '';

      try {
        if (fmt === 'wkt') {
            content = toWKT(activeLayer.data);
            ext = 'txt';
        } else if (fmt === 'geojson') {
            content = JSON.stringify(activeLayer.data, null, 2);
            ext = 'json';
        } else if (fmt === 'csv') {
            content = toCSV(activeLayer.data);
            ext = 'csv';
        } else if (fmt === 'kml') {
            content = toKML(activeLayer.data);
            ext = 'kml';
        } else if (fmt === 'gpx') {
            content = toGPX(activeLayer.data);
            ext = 'gpx';
        }

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeLayer.name || 'geoforge'}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (e) {
          alert("Export failed: " + e);
      }
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
              // Trigger update
              updateActiveLayerData(editorValue, 'wkt');
          } else {
              alert("No repairs needed or could not repair.");
          }
      } else {
          alert("Repair only available for WKT.");
      }
  }

  function handleDraw(e: CustomEvent<GeoJSON>) {
      // Add new layer with drawn geometry
      const type = e.detail.type;
      addLayer(`Drawn ${type}`, e.detail);
      mode = 'view';
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
        "WKT/GeoJSON/CSV/KML/GPX Converter",
        "Multi-layer Visualization",
        "Convex Hull & Buffer Generator",
        "Geometry Simplification",
        "Client-side Privacy",
        "Interactive Drawing"
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
            aria-label="Toggle history"
         >
            <Clock class="w-4 h-4" />
            <span class="hidden sm:inline">Recent</span>
         </button>
         <button
            class="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors text-sm font-medium"
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
                class="px-3 py-1.5 rounded-md text-sm font-medium transition-all {activeTab === 'map' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'}"
                on:click={() => activeTab = 'map'}
                aria-label="Switch to map view"
             >
                Map View
             </button>
             <button
                class="px-3 py-1.5 rounded-md text-sm font-medium transition-all {activeTab === 'data' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'}"
                on:click={() => activeTab = 'data'}
                aria-label="Switch to data editor"
             >
                Data Editor
             </button>
         </div>
     </div>
  </div>

  <!-- Main Workspace -->
  <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar (Layers & Stats) -->
      <div class="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 hidden lg:flex flex-col overflow-y-auto z-10">

          <!-- Layers Panel -->
          <div class="p-4 border-b border-slate-200 dark:border-slate-700">
              <div class="flex justify-between items-center mb-3">
                  <h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <Layers class="w-4 h-4" /> Layers
                  </h3>
                  <button class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors" on:click={() => addLayer(`Layer ${layers.length + 1}`)} aria-label="Add new layer">
                      <Plus class="w-4 h-4" />
                  </button>
              </div>

              <div class="flex flex-col gap-1 max-h-48 overflow-y-auto">
                  {#each layers as layer (layer.id)}
                      <div
                         class="flex items-center gap-2 p-2 rounded-lg text-sm group border {activeLayerId === layer.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-700'}"
                         role="button"
                         tabindex="0"
                         on:click={() => activeLayerId = layer.id}
                         on:keydown={(e) => e.key === 'Enter' && (activeLayerId = layer.id)}
                      >
                          <button class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" on:click|stopPropagation={() => toggleLayer(layer.id)} aria-label="Toggle layer visibility">
                              {#if layer.visible}
                                  <Eye class="w-3 h-3" />
                              {:else}
                                  <EyeOff class="w-3 h-3" />
                              {/if}
                          </button>

                          <div class="w-3 h-3 rounded-full shrink-0" style="background-color: {layer.color}"></div>

                          <span class="truncate flex-1 font-medium text-slate-700 dark:text-slate-200">{layer.name}</span>

                          <button class="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" on:click|stopPropagation={() => removeLayer(layer.id)} aria-label="Delete layer">
                              <Trash2 class="w-3 h-3" />
                          </button>
                      </div>
                  {/each}
              </div>
          </div>

          <!-- Tools Panel -->
          <div class="p-4 border-b border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2">
               <button class="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-all gap-1" on:click={handleConvexHull} title="Create Convex Hull from active layer" aria-label="Create Convex Hull">
                   <Box class="w-5 h-5" />
                   <span class="text-xs font-medium">Convex Hull</span>
               </button>
               <button class="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-all gap-1" on:click={handleBBox} title="Get Bounding Box" aria-label="Get Bounding Box">
                   <Maximize class="w-5 h-5" />
                   <span class="text-xs font-medium">Bounds</span>
               </button>
          </div>

          <!-- Stats -->
          <div class="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 class="font-bold text-slate-800 dark:text-white mb-2">Active Stats</h3>
              <StatsPanel geo={activeLayer?.data || null} {dict} columns={1} />
          </div>

          <!-- Converter -->
          <div class="p-4 flex-1">
              <h3 class="font-bold text-slate-800 dark:text-white mb-4">Converter</h3>
              <div class="grid grid-cols-1 gap-2">
                  <button class="w-full py-2 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-left text-sm font-medium transition-colors {editorFormat === 'wkt' ? 'ring-2 ring-indigo-500' : ''}" on:click={() => handleConvert('wkt')}>
                      To WKT
                  </button>
                  <button class="w-full py-2 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-left text-sm font-medium transition-colors {editorFormat === 'geojson' ? 'ring-2 ring-indigo-500' : ''}" on:click={() => handleConvert('geojson')}>
                      To GeoJSON
                  </button>
                  <button class="w-full py-2 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-left text-sm font-medium transition-colors {editorFormat === 'csv' ? 'ring-2 ring-indigo-500' : ''}" on:click={() => handleConvert('csv')}>
                      To CSV
                  </button>
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
                  <MapCanvas
                      bind:this={mapCanvas}
                      {layers}
                      {activeLayerId}
                      {dict}
                      bind:mode
                      on:draw={handleDraw}
                  />

                  <!-- Mobile Stats Overlay -->
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
                                    <button class="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded hover:bg-red-200" on:click={handleRepair}>Auto-Repair</button>
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
</div>
