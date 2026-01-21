<script lang="ts">
  import { getViewport, generatePath, projectToScreen, screenToGeo, type Viewport } from '$lib/utils/geo-forge';
  import type { GeoJSON, Position } from '$lib/utils/geo-forge';
  import { onMount } from 'svelte';
  import { Maximize, Minus, Plus } from 'lucide-svelte';

  export let geo: GeoJSON | null = null;
  export let dict: any;

  let container: HTMLDivElement;
  let width = 0;
  let height = 0;
  let pathD = '';
  let vp: Viewport | null = null;

  // Interaction State
  let zoom = 1;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;

  // Mouse Info
  let mouseGeo: Position | null = null;

  $: if (geo && width > 0 && height > 0) {
      // Recalculate base viewport only when geometry changes or resize,
      // NOT when panning/zooming (unless we want to reset).
      // Actually, we should separate base calculation from user transform.
      updateBaseViewport();
  }

  function updateBaseViewport() {
      if (!geo || width === 0 || height === 0) return;
      vp = getViewport(geo, width, height, 40);
      render();
  }

  function render() {
      if (!geo || !vp) return;

      // Apply user transform to viewport before generating path?
      // No, `generatePath` uses `projectToScreen` which uses `vp`.
      // We can create a "derived" viewport.

      const activeVp: Viewport = {
          ...vp,
          scale: vp.scale * zoom,
          width: vp.width,
          height: vp.height,
          offsetX: vp.offsetX - (panX / vp.scale / zoom), // Adjust center based on pan?
          offsetY: vp.offsetY + (panY / vp.scale / zoom)  // Complex.
      };

      // Simpler approach:
      // Generate path using base viewport.
      // Apply transform to the SVG group.
      pathD = generatePath(geo, vp);
  }

  // Watch for geo change to reset view
  let lastGeo: GeoJSON | null = null;
  $: if (geo !== lastGeo) {
      lastGeo = geo;
      resetView();
  }

  function resetView() {
      zoom = 1;
      panX = 0;
      panY = 0;
      updateBaseViewport();
  }

  function handleWheel(e: WheelEvent) {
      e.preventDefault();
      const delta = -Math.sign(e.deltaY) * 0.1;
      const newZoom = Math.max(0.1, Math.min(10, zoom + delta));
      zoom = newZoom;
  }

  function handleMouseDown(e: MouseEvent) {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
  }

  function handleMouseMove(e: MouseEvent) {
      if (isDragging) {
          const dx = e.clientX - lastX;
          const dy = e.clientY - lastY;
          panX += dx;
          panY += dy;
          lastX = e.clientX;
          lastY = e.clientY;
      }

      if (vp) {
          // Convert screen mouse to geo
          // Need to reverse the SVG transform
          // Screen relative to container
          const rect = container.getBoundingClientRect();
          const mx = e.clientX - rect.left;
          const my = e.clientY - rect.top;

          // Apply inverse transform of the group: translate(panX, panY) scale(zoom) around center?
          // The group transform is `translate(${panX}px, ${panY}px) scale(${zoom})` from center (width/2, height/2).
          // Actually, let's keep it simple: transform-origin is center.

          // Calculate coordinate in "base viewport space"
          const cx = width / 2;
          const cy = height / 2;

          // (mx - cx - panX) / zoom + cx = baseScreenX
          const baseScreenX = (mx - cx - panX) / zoom + cx;
          const baseScreenY = (my - cy - panY) / zoom + cy;

          mouseGeo = screenToGeo(baseScreenX, baseScreenY, vp);
      }
  }

  function handleMouseUp() {
      isDragging = false;
  }
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div
  role="application"
  aria-label="Interactive Map"
  class="relative w-full h-full bg-slate-100 dark:bg-slate-900 overflow-hidden cursor-crosshair group"
  bind:this={container}
  bind:clientWidth={width}
  bind:clientHeight={height}
  on:wheel={handleWheel}
  on:mousedown={handleMouseDown}
  on:mousemove={handleMouseMove}
  on:mouseup={handleMouseUp}
  on:mouseleave={handleMouseUp}
>
  {#if !geo}
    <div class="absolute inset-0 flex items-center justify-center text-slate-400">
      <p>{dict?.empty || 'Load geometry to visualize'}</p>
    </div>
  {:else}
    <svg class="w-full h-full pointer-events-none">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" class="text-slate-200 dark:text-slate-800" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />

      <g
        transform="translate({panX}, {panY}) scale({zoom})"
        style="transform-origin: center;"
        class="transition-transform duration-75"
      >
        <path
          d={pathD}
          fill="rgba(99, 102, 241, 0.2)"
          stroke="rgb(99, 102, 241)"
          stroke-width={2 / zoom}
          vector-effect="non-scaling-stroke"
        />
      </g>
    </svg>

    <!-- Controls -->
    <div class="absolute bottom-4 right-4 flex flex-col gap-2 pointer-events-auto">
        <button class="p-2 bg-white dark:bg-slate-800 shadow rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300" on:click={resetView}>
            <Maximize class="w-5 h-5" />
        </button>
        <button class="p-2 bg-white dark:bg-slate-800 shadow rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300" on:click={() => zoom = Math.min(10, zoom * 1.2)}>
            <Plus class="w-5 h-5" />
        </button>
        <button class="p-2 bg-white dark:bg-slate-800 shadow rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300" on:click={() => zoom = Math.max(0.1, zoom / 1.2)}>
            <Minus class="w-5 h-5" />
        </button>
    </div>

    <!-- Info Overlay -->
    {#if mouseGeo}
        <div class="absolute bottom-4 left-4 px-2 py-1 bg-black/70 text-white text-xs font-mono rounded pointer-events-none">
            {mouseGeo[1].toFixed(5)}, {mouseGeo[0].toFixed(5)}
        </div>
    {/if}
  {/if}
</div>
