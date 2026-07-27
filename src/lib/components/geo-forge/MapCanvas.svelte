<script lang="ts">
  import { getViewport, generatePath, projectToScreen, screenToGeo, distance, type Viewport } from '$lib/utils/geo-forge';
  import type { GeoJSON, Position, Layer } from '$lib/utils/geo-forge/types';
  import { createEventDispatcher } from 'svelte';
  import { Maximize, Minus, Plus, Hand, PenTool, Eraser, Ruler } from '@lucide/svelte';

  export let layers: Layer[] = [];
  export let activeLayerId: string | null = null;
  export let mode: 'view' | 'draw_point' | 'draw_line' | 'draw_poly' | 'draw_ruler' = 'view';
  export let dict: any = {};

  const dispatch = createEventDispatcher();

  let container: HTMLDivElement;
  let svgElement: SVGSVGElement;
  let width = 0;
  let height = 0;
  let paths: { id: string, d: string, color: string, visible: boolean }[] = [];
  let vp: Viewport | null = null;

  // Interaction State
  let zoom = 1;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;

  // Drawing State
  let drawnPoints: Position[] = [];
  let currentMousePos: Position | null = null; // For rubber banding

  // Mouse Info
  let mouseGeo: Position | null = null;

  $: if (layers.length > 0 && width > 0 && height > 0) {
      if (!vp) {
         // Initialize VP on first load
         fitToAll();
      } else {
         render();
      }
  }

  function fitToAll() {
      const allGeo: GeoJSON[] = layers.filter(l => l.visible && l.data).map(l => l.data!);
      if (allGeo.length === 0 || width === 0 || height === 0) return;

      // Combine all to find bbox
      // For simplicity, just use the first one or logic to combine bboxes
      // Here we will just use the first visible one for now, or improve getViewport to handle array
      // Let's iterate and merge bboxes
      // ... (implementation of merged bbox logic is implicit in getViewport if I updated it, but I didn't.
      //  So I'll just use the active layer or first layer to center)

      const target = layers.find(l => l.id === activeLayerId)?.data || layers.find(l => l.visible)?.data;

      if (target) {
          vp = getViewport(target, width, height, 40);
          zoom = 1;
          panX = 0;
          panY = 0;
          render();
      }
  }

  function render() {
      if (!vp) return;
      paths = layers.map(layer => {
          if (!layer.data || !layer.visible) return { id: layer.id, d: '', color: layer.color, visible: false };
          return {
              id: layer.id,
              d: generatePath(layer.data, vp!),
              color: layer.color,
              visible: true
          };
      });
  }

  // Watch for layers change
  $: {
      if (layers) render();
  }

  // Drawing preview path
  $: drawingPathD = getDrawingPath(drawnPoints, currentMousePos, mode, vp);

  function getDrawingPath(points: Position[], mouse: Position | null, mode: string, vp: Viewport | null): string {
      if (!vp || points.length === 0) return '';

      let screenPoints = points.map(p => projectToScreen(p, vp));

      if (mouse && mode !== 'draw_point') {
          screenPoints.push(projectToScreen(mouse, vp));
      }

      if (screenPoints.length === 0) return '';

      if (mode === 'draw_point') {
          return screenPoints.map(p => `M ${p[0]-5},${p[1]} L ${p[0]+5},${p[1]} M ${p[0]},${p[1]-5} L ${p[0]},${p[1]+5}`).join(' ');
      } else {
          let d = `M ${screenPoints[0][0]} ${screenPoints[0][1]}`;
          for (let i = 1; i < screenPoints.length; i++) {
              d += ` L ${screenPoints[i][0]} ${screenPoints[i][1]}`;
          }
          if (mode === 'draw_poly' && screenPoints.length > 2 && mouse === null) {
              d += ' Z';
          }
          return d;
      }
  }

  function handleKeyDown(e: KeyboardEvent) {
      if (mode !== 'view') {
          if (e.key === 'Escape') cancelDrawing();
          return;
      }
      const step = 50;
      switch(e.key) {
          case 'ArrowLeft': panX += step; break;
          case 'ArrowRight': panX -= step; break;
          case 'ArrowUp': panY += step; break;
          case 'ArrowDown': panY -= step; break;
          case '+': case '=': zoom = Math.min(20, zoom * 1.2); break;
          case '-': case '_': zoom = Math.max(0.1, zoom / 1.2); break;
      }
  }

  function formatDist(d: number) {
      if (d > 1000) return (d / 1000).toFixed(2) + 'km';
      return d.toFixed(0) + 'm';
  }

  function handleWheel(e: WheelEvent) {
      e.preventDefault();
      const delta = -Math.sign(e.deltaY) * 0.1;
      const newZoom = Math.max(0.1, Math.min(20, zoom + delta));
      zoom = newZoom;
  }

  function handleMouseDown(e: MouseEvent) {
      if (mode === 'view') {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
      } else {
          // Drawing logic
          if (!mouseGeo) return;

          if (mode === 'draw_point') {
              dispatch('draw', { type: 'Point', coordinates: mouseGeo });
              // Reset mode or stay? Let's stay for multiple points
          } else {
              drawnPoints = [...drawnPoints, mouseGeo];
          }
      }
  }

  function handleMouseMove(e: MouseEvent) {
      // Calculate mouse geo
      if (vp) {
          const rect = container.getBoundingClientRect();
          const mx = e.clientX - rect.left;
          const my = e.clientY - rect.top;

          const cx = width / 2;
          const cy = height / 2;

          // Apply reverse transform of group
          // transform="translate({panX}, {panY}) scale({zoom})"
          // screenX = (mx - panX - cx) / zoom + cx ??? No.
          // Let's trace render logic:
          // SVG Group is transformed.
          // Inside Group, coords are "base screen coords" from projectToScreen.
          // To get "base screen coords" from mouse event (mx, my):
          // mx = (baseX * zoom) + panX
          // baseX = (mx - panX) / zoom
          // Wait, projectToScreen centers it at width/2, height/2.
          // So if panX=0, zoom=1, baseX should be mx.
          // Correct formula:
          // baseX = (mx - panX - cx) / zoom + cx;  <-- This assumes projectToScreen output is relative to 0,0 top-left?
          // getViewport returns scale and translate to fit in width/height.
          // projectToScreen returns [x, y] in SVG coordinates (0..width, 0..height).

          // The Group transform applies to the whole SVG content.
          // We center the zoom at the center of the viewport (cx, cy).
          // Actually, my CSS transform origin is center.
          // transform-origin: center -> means 50% 50% of the SVG element.

          // Let's simplify.
          // Adjusted X relative to center (because of scale from center)
          // adjustedX = (mx - cx) / zoom + cx - panX / zoom?
          // This is getting complicated math.

          // Let's assume standard pan/zoom behavior:
          // render coords (P) -> transformed (T)
          // T = (P - Center) * zoom + Center + Pan
          // P = (T - Pan - Center) / zoom + Center

          const baseX = (mx - panX - cx) / zoom + cx;
          const baseY = (my - panY - cy) / zoom + cy;

          mouseGeo = screenToGeo(baseX, baseY, vp);
          currentMousePos = mouseGeo;
      }

      if (isDragging) {
          const dx = e.clientX - lastX;
          const dy = e.clientY - lastY;
          panX += dx;
          panY += dy;
          lastX = e.clientX;
          lastY = e.clientY;
      }
  }

  function handleMouseUp() {
      isDragging = false;
  }

  function handleDbClick() {
      if (mode === 'draw_line' || mode === 'draw_poly' || mode === 'draw_ruler') {
          finishDrawing();
      }
  }

  function finishDrawing() {
      if (drawnPoints.length < 2) {
          drawnPoints = [];
          return;
      }

      if (mode === 'draw_ruler') {
           // Create a persistent measurement layer?
           // For now, let's just turn it into a LineString with name "Measurement"
           const geometry: GeoJSON = { type: 'LineString', coordinates: drawnPoints };
           dispatch('draw', { ...geometry, properties: { type: 'measurement' } });
      } else {
          let geometry: GeoJSON;
          if (mode === 'draw_line') {
              geometry = { type: 'LineString', coordinates: drawnPoints };
          } else {
               // Close polygon if needed
               if (drawnPoints.length > 2) {
                   const first = drawnPoints[0];
                   const last = drawnPoints[drawnPoints.length-1];
                   if (first[0] !== last[0] || first[1] !== last[1]) {
                       drawnPoints.push(first);
                   }
                   geometry = { type: 'Polygon', coordinates: [drawnPoints] };
               } else {
                   // Fallback to line
                   geometry = { type: 'LineString', coordinates: drawnPoints };
               }
          }
          dispatch('draw', geometry);
      }
      drawnPoints = [];
  }

  function cancelDrawing() {
      drawnPoints = [];
      mode = 'view';
      dispatch('modeChange', 'view');
  }

  export async function getSnapshot(): Promise<string> {
      if (!svgElement) return '';

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      // Fill background
      ctx.fillStyle = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? '#0f172a' : '#ffffff';
      ctx.fillRect(0, 0, width, height);

      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      return new Promise((resolve) => {
          img.onload = () => {
              ctx.drawImage(img, 0, 0);
              URL.revokeObjectURL(url);
              resolve(canvas.toDataURL('image/png'));
          };
          img.src = url;
      });
  }
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div
  role="application"
  aria-label="Interactive Map"
  tabindex="0"
  class="relative w-full h-full bg-slate-100 dark:bg-slate-900 overflow-hidden cursor-crosshair group select-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
  bind:this={container}
  bind:clientWidth={width}
  bind:clientHeight={height}
  on:wheel={handleWheel}
  on:mousedown={handleMouseDown}
  on:mousemove={handleMouseMove}
  on:mouseup={handleMouseUp}
  on:mouseleave={handleMouseUp}
  on:dblclick={handleDbClick}
  on:keydown={handleKeyDown}
>
    <!-- Background Grid -->
    <svg class="absolute inset-0 w-full h-full pointer-events-none z-0" bind:this={svgElement}>
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" class="text-slate-200 dark:text-slate-800" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />

      <g
        transform="translate({panX}, {panY}) scale({zoom})"
        style="transform-origin: 50% 50%;"
        class="transition-transform duration-75"
      >
        <!-- Render Layers -->
        {#each paths as path (path.id)}
            {#if path.visible}
                <path
                  d={path.d}
                  fill={path.color}
                  fill-opacity="0.2"
                  stroke={path.color}
                  stroke-width={2 / zoom}
                  vector-effect="non-scaling-stroke"
                  class="transition-all duration-300"
                />
            {/if}
        {/each}

        <!-- Drawing Preview -->
        {#if drawnPoints.length > 0 || mode === 'draw_point'}
             <path
                d={drawingPathD}
                fill="none"
                stroke={mode === 'draw_ruler' ? '#f59e0b' : '#ef4444'}
                stroke-width={2 / zoom}
                stroke-dasharray={mode === 'draw_ruler' ? "2,2" : "4"}
                vector-effect="non-scaling-stroke"
             />
             {#each drawnPoints as p, i (i)}
                 {#if vp}
                    {@const sc = projectToScreen(p, vp)}
                    <circle cx={sc[0]} cy={sc[1]} r={4/zoom} fill={mode === 'draw_ruler' ? '#f59e0b' : '#ef4444'} />

                    <!-- Measurement Labels -->
                    {#if mode === 'draw_ruler' && i > 0}
                        {@const prev = drawnPoints[i-1]}
                        {@const dist = distance(prev, p)}
                        {@const prevSc = projectToScreen(prev, vp)}
                        {@const midX = (sc[0] + prevSc[0]) / 2}
                        {@const midY = (sc[1] + prevSc[1]) / 2}
                        <g pointer-events="none">
                            <rect x={midX - 25} y={midY - 10} width="50" height="20" rx="4" fill="white" fill-opacity="0.8" />
                            <text x={midX} y={midY} dy="5" text-anchor="middle" font-size="10px" fill="black" font-weight="bold">
                                {formatDist(dist)}
                            </text>
                        </g>
                    {/if}
                 {/if}
             {/each}

             <!-- Dynamic label for current mouse segment in ruler mode -->
             {#if mode === 'draw_ruler' && currentMousePos && drawnPoints.length > 0 && vp}
                  {@const last = drawnPoints[drawnPoints.length-1]}
                  {@const dist = distance(last, currentMousePos)}
                  {@const sc = projectToScreen(currentMousePos, vp)}
                  {@const prevSc = projectToScreen(last, vp)}
                  {@const midX = (sc[0] + prevSc[0]) / 2}
                  {@const midY = (sc[1] + prevSc[1]) / 2}
                  <g pointer-events="none">
                      <rect x={midX - 25} y={midY - 10} width="50" height="20" rx="4" fill="#f59e0b" fill-opacity="0.9" />
                      <text x={midX} y={midY} dy="5" text-anchor="middle" font-size="10px" fill="white" font-weight="bold">
                          {formatDist(dist)}
                      </text>
                  </g>
             {/if}
        {/if}
      </g>
    </svg>

    <!-- Empty State -->
    {#if layers.length === 0 && mode === 'view'}
        <div class="absolute inset-0 flex items-center justify-center text-slate-400 pointer-events-none">
          <p>{(dict as any)?.empty || 'Load geometry to visualize'}</p>
        </div>
    {/if}

    <!-- Map Controls (Bottom Right) -->
    <div class="absolute bottom-4 right-4 flex flex-col gap-2 pointer-events-auto z-20">
        <button class="p-2 bg-white dark:bg-slate-800 shadow rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300" on:click={fitToAll} aria-label="Reset View" title="Fit to bounds">
            <Maximize class="w-5 h-5" />
        </button>
        <button class="p-2 bg-white dark:bg-slate-800 shadow rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300" on:click={() => zoom = Math.min(20, zoom * 1.2)} aria-label="Zoom In">
            <Plus class="w-5 h-5" />
        </button>
        <button class="p-2 bg-white dark:bg-slate-800 shadow rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300" on:click={() => zoom = Math.max(0.1, zoom / 1.2)} aria-label="Zoom Out">
            <Minus class="w-5 h-5" />
        </button>
    </div>

    <!-- Mode Controls (Top Center/Right) -->
    <div class="absolute top-4 right-4 flex gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg shadow border border-slate-200 dark:border-slate-700 z-20">
        <button
            class="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 {mode === 'view' ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600' : 'text-slate-500'}"
            on:click={() => { mode = 'view'; dispatch('modeChange', 'view'); }}
            title="Pan/Zoom"
        >
            <Hand class="w-4 h-4" />
        </button>
        <div class="w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
        <button
            class="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 {mode === 'draw_point' ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600' : 'text-slate-500'}"
            on:click={() => { mode = 'draw_point'; dispatch('modeChange', 'draw_point'); }}
            title="Draw Point"
        >
            <div class="w-4 h-4 flex items-center justify-center font-bold">●</div>
        </button>
        <button
            class="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 {mode === 'draw_line' ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600' : 'text-slate-500'}"
            on:click={() => { mode = 'draw_line'; dispatch('modeChange', 'draw_line'); }}
            title="Draw Line (Double Click to Finish)"
        >
            <div class="w-4 h-4 flex items-center justify-center font-bold">/</div>
        </button>
        <button
            class="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 {mode === 'draw_poly' ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600' : 'text-slate-500'}"
            on:click={() => { mode = 'draw_poly'; dispatch('modeChange', 'draw_poly'); }}
            title="Draw Polygon (Double Click to Finish)"
        >
            <PenTool class="w-4 h-4" />
        </button>
        <button
            class="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 {mode === 'draw_ruler' ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600' : 'text-slate-500'}"
            on:click={() => { mode = 'draw_ruler'; dispatch('modeChange', 'draw_ruler'); }}
            title="Measure Distance"
        >
            <Ruler class="w-4 h-4" />
        </button>
        {#if drawnPoints.length > 0}
            <button class="p-2 text-red-500 hover:bg-red-50 rounded" on:click={cancelDrawing} title="Cancel Drawing">
                <Eraser class="w-4 h-4" />
            </button>
            <button class="p-2 text-green-500 hover:bg-green-50 rounded font-bold text-xs" on:click={finishDrawing} title="Finish">
                OK
            </button>
        {/if}
    </div>

    <!-- Info Overlay -->
    {#if mouseGeo}
        <div class="absolute bottom-4 left-4 px-2 py-1 bg-black/70 text-white text-xs font-mono rounded pointer-events-none z-20 backdrop-blur-sm">
            Lat: {mouseGeo[1].toFixed(5)} <br/> Lon: {mouseGeo[0].toFixed(5)}
        </div>
    {/if}

    {#if mode !== 'view'}
        <div class="absolute top-16 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full pointer-events-none z-20 backdrop-blur-sm">
            {#if mode === 'draw_point'}Click map to add point
            {:else if mode === 'draw_line'}Click to add points, Double-click to finish
            {:else if mode === 'draw_poly'}Click to add vertices, Double-click to close
            {:else if mode === 'draw_ruler'}Click to measure points, Double-click to finish
            {/if}
        </div>
    {/if}
</div>
