<script lang="ts">
  import { bannerStore } from '$lib/utils/banner-forge/store';
  import { onMount } from 'svelte';

  export let id = "banner-canvas";

  $: state = $bannerStore;

  let isDragging = false;
  let isResizing = false;
  let dragId: string | null = null;
  let resizeHandle: string | null = null;

  let startX = 0;
  let startY = 0;

  let initialLayerX = 0;
  let initialLayerY = 0;
  let initialWidth = 0;
  let initialHeight = 0;

  function getBackgroundStyle(bg: typeof state.background) {
    if (bg.type === 'color') return `background-color: ${bg.value}`;
    if (bg.type === 'gradient') return `background-image: ${bg.value}`;
    if (bg.type === 'image') return `background-image: url(${bg.value}); background-size: cover; background-position: center;`;
    if (bg.type === 'pattern') {
        if (bg.value === 'dots') return `background-image: radial-gradient(#cbd5e1 1px, transparent 1px); background-size: 20px 20px; background-color: #f8fafc;`;
        if (bg.value === 'lines') return `background: repeating-linear-gradient(45deg, #f1f5f9, #f1f5f9 10px, #e2e8f0 10px, #e2e8f0 20px);`;
        if (bg.value === 'grid') return `background-image: linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px); background-size: 20px 20px; background-color: #ffffff;`;
        if (bg.value === 'checker') return `background-image: linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%); background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0px; background-color: #ffffff;`;
    }
    return '';
  }

  function handleLayerMouseDown(e: MouseEvent, id: string) {
    e.stopPropagation();
    bannerStore.selectLayer(id);

    isDragging = true;
    dragId = id;
    startX = e.clientX;
    startY = e.clientY;

    const layer = state.layers.find(l => l.id === id);
    if (layer) {
        initialLayerX = layer.x;
        initialLayerY = layer.y;
    }

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  }

  function handleResizeMouseDown(e: MouseEvent, handle: string) {
      e.stopPropagation();
      // Ensure the layer remains selected
      // (The click on handle is inside the layer div, but we stop propagation so handleLayerMouseDown won't fire?
      // Actually handleLayerMouseDown is on the div. The handle is a child.
      // If I stop propagation here, layer mousedown won't trigger.
      // But I should assume the layer is already selected if I can see handles.

      isResizing = true;
      resizeHandle = handle;
      startX = e.clientX;
      startY = e.clientY;

      const layer = state.layers.find(l => l.id === state.selectedLayerId);
      if (layer) {
          initialWidth = layer.width;
          initialHeight = layer.height;
          initialLayerX = layer.x;
          initialLayerY = layer.y;
      }

      window.addEventListener('mousemove', handleWindowMouseMove);
      window.addEventListener('mouseup', handleWindowMouseUp);
  }

  function handleWindowMouseMove(e: MouseEvent) {
      if (!isDragging && !isResizing) return;

      const canvasEl = document.getElementById(id);
      let scale = 1;
      if (canvasEl) {
          const rect = canvasEl.getBoundingClientRect();
          // The scale of the canvas element relative to its internal width
          scale = rect.width / state.width;
      }
      if (scale === 0) scale = 1;

      const dx = (e.clientX - startX) / scale;
      const dy = (e.clientY - startY) / scale;

      if (isDragging && dragId) {
          bannerStore.updateLayer(dragId, {
              x: initialLayerX + dx,
              y: initialLayerY + dy
          });
      } else if (isResizing && state.selectedLayerId) {
          let newWidth = initialWidth;
          let newHeight = initialHeight;
          let newX = initialLayerX;
          let newY = initialLayerY;

          // Horizontal Resize
          if (resizeHandle?.includes('right')) {
               newWidth = Math.max(20, initialWidth + dx);
               newX = initialLayerX + dx / 2;
          } else if (resizeHandle?.includes('left')) {
               newWidth = Math.max(20, initialWidth - dx);
               newX = initialLayerX + dx / 2;
          }

          // Vertical Resize
          if (resizeHandle?.includes('bottom')) {
               newHeight = Math.max(20, initialHeight + dy);
               newY = initialLayerY + dy / 2;
          } else if (resizeHandle?.includes('top')) {
               newHeight = Math.max(20, initialHeight - dy);
               newY = initialLayerY + dy / 2;
          }

          bannerStore.updateLayer(state.selectedLayerId, {
              width: newWidth,
              height: newHeight,
              x: newX,
              y: newY
          });
      }
  }

  function handleWindowMouseUp() {
      isDragging = false;
      isResizing = false;
      dragId = null;
      resizeHandle = null;
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
  }

  function handleCanvasClick() {
    bannerStore.selectLayer(null);
  }
</script>

<div class="flex items-center justify-center p-8 bg-slate-100 dark:bg-slate-900 overflow-auto h-full w-full relative">
  <div
    {id}
    class="relative shadow-2xl transition-all duration-300 ease-in-out origin-center bg-white shrink-0"
    style="
      width: {state.width}px;
      height: {state.height}px;
      {getBackgroundStyle(state.background)}
    "
    on:click={handleCanvasClick}
    role="button"
    tabindex="0"
    on:keydown={() => {}}
  >
    <!-- Overlay -->
    {#if state.background.overlay}
      <div class="absolute inset-0 bg-black pointer-events-none" style="opacity: {state.background.overlay}"></div>
    {/if}

    <!-- Layers -->
    {#each state.layers as layer (layer.id)}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
            class="absolute flex items-center justify-center cursor-move group hover:ring-1 hover:ring-indigo-300 transition-shadow select-none
                   {state.selectedLayerId === layer.id ? 'ring-2 ring-indigo-500 z-[100]' : ''}"
            style="
                left: {layer.x}px;
                top: {layer.y}px;
                width: {layer.width}px;
                height: {layer.height}px;
                transform: translate(-50%, -50%) rotate({layer.rotation}deg);
                z-index: {layer.zIndex};
            "
            on:mousedown={(e) => handleLayerMouseDown(e, layer.id)}
        >
            {#if layer.type === 'text'}
                <div style="
                    font-size: {layer.style.fontSize};
                    font-weight: {layer.style.fontWeight};
                    color: {layer.style.color};
                    text-align: {layer.style.textAlign};
                    font-family: {layer.style.fontFamily};
                    line-height: {layer.style.lineHeight || 1.2};
                    text-shadow: {layer.style.textShadow || 'none'};
                    width: 100%;
                    height: 100%;
                    word-wrap: break-word;
                    white-space: pre-wrap;
                    display: flex;
                    align-items: center;
                    justify-content: {layer.style.textAlign === 'left' ? 'flex-start' : layer.style.textAlign === 'right' ? 'flex-end' : 'center'};
                ">
                    {layer.content}
                </div>
            {:else if layer.type === 'image'}
                <img
                    src={layer.content}
                    alt="layer"
                    class="w-full h-full object-cover pointer-events-none"
                    style="border-radius: {layer.style.borderRadius || 0}"
                />
            {/if}

            <!-- Resize Handles (Visual & Functional) -->
            {#if state.selectedLayerId === layer.id}
                <!-- Top Left -->
                <div
                    class="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-indigo-500 rounded-full cursor-nw-resize z-50 hover:scale-125 transition-transform"
                    on:mousedown={(e) => handleResizeMouseDown(e, 'top-left')}
                ></div>
                <!-- Top Right -->
                <div
                    class="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-indigo-500 rounded-full cursor-ne-resize z-50 hover:scale-125 transition-transform"
                    on:mousedown={(e) => handleResizeMouseDown(e, 'top-right')}
                ></div>
                <!-- Bottom Left -->
                <div
                    class="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-indigo-500 rounded-full cursor-sw-resize z-50 hover:scale-125 transition-transform"
                    on:mousedown={(e) => handleResizeMouseDown(e, 'bottom-left')}
                ></div>
                <!-- Bottom Right -->
                <div
                    class="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-indigo-500 rounded-full cursor-se-resize z-50 hover:scale-125 transition-transform"
                    on:mousedown={(e) => handleResizeMouseDown(e, 'bottom-right')}
                ></div>
            {/if}
        </div>
    {/each}
  </div>
</div>
