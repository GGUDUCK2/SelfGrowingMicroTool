<script lang="ts">
  import { bannerStore } from '$lib/utils/banner-forge/store';
  import { sizes, gradients, patterns } from '$lib/utils/banner-forge/presets';
  import { createEventDispatcher } from 'svelte';
  import { nanoid } from 'nanoid';

  export let dict: any;

  $: state = $bannerStore;
  $: selectedLayer = state.layers.find(l => l.id === state.selectedLayerId);

  const dispatch = createEventDispatcher();

  function handleResize(preset: any) {
    bannerStore.resize(preset.width, preset.height);
  }

  function handleBackground(type: string, value: string) {
    bannerStore.setBackground(type, value);
  }

  function addTextLayer() {
      bannerStore.addLayer({
          id: nanoid(),
          type: 'text',
          x: state.width / 2,
          y: state.height / 2,
          width: 600,
          height: 100,
          rotation: 0,
          zIndex: state.layers.length + 1,
          content: 'New Text',
          style: {
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#000000',
              textAlign: 'center',
              fontFamily: 'Inter'
          }
      });
  }

  function handleImageUpload(e: Event) {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
              const url = e.target?.result as string;
              bannerStore.addLayer({
                  id: nanoid(),
                  type: 'image',
                  x: state.width / 2,
                  y: state.height / 2,
                  width: 300,
                  height: 300,
                  rotation: 0,
                  zIndex: state.layers.length + 1,
                  content: url,
                  style: {
                      borderRadius: '0px'
                  }
              });
          };
          reader.readAsDataURL(file);
      }
  }

  function updateLayer(prop: string, value: any) {
      if (state.selectedLayerId) {
          if (prop === 'content') {
              bannerStore.updateLayer(state.selectedLayerId, { content: value });
          } else if (['x', 'y', 'width', 'height', 'rotation'].includes(prop)) {
              bannerStore.updateLayer(state.selectedLayerId, { [prop]: Number(value) });
          } else {
             const layer = state.layers.find(l => l.id === state.selectedLayerId);
             if (layer) {
                 bannerStore.updateLayer(state.selectedLayerId, { style: { ...layer.style, [prop]: value } });
             }
          }
      }
  }

  function deleteLayer() {
      if (state.selectedLayerId) {
          bannerStore.removeLayer(state.selectedLayerId);
      }
  }
</script>

<div class="space-y-6">
    <!-- Dimensions -->
    <div class="space-y-2">
        <h3 class="text-xs font-semibold uppercase text-slate-500 tracking-wider">{dict.dimensions}</h3>
        <div class="grid grid-cols-2 gap-2">
            {#each sizes as size}
                <button
                    class="px-2 py-2 text-xs border rounded hover:bg-indigo-50 hover:border-indigo-200 truncate transition-colors text-left
                           {state.width === size.width && state.height === size.height ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'}"
                    on:click={() => handleResize(size)}
                    title="{size.width}x{size.height}"
                >
                    <div class="font-medium">{size.name}</div>
                    <div class="text-[10px] opacity-70">{size.width}x{size.height}</div>
                </button>
            {/each}
        </div>
    </div>

    <!-- Background -->
    <div class="space-y-2">
        <h3 class="text-xs font-semibold uppercase text-slate-500 tracking-wider">{dict.background}</h3>

        <!-- Tabs for BG Type -->
        <div class="flex gap-2 mb-2">
             <button class="flex-1 py-1 text-xs border-b-2 {state.background.type === 'color' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500'}" on:click={() => handleBackground('color', '#ffffff')}>{dict.color}</button>
             <button class="flex-1 py-1 text-xs border-b-2 {state.background.type === 'gradient' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500'}" on:click={() => handleBackground('gradient', gradients[0])}>{dict.gradient}</button>
             <button class="flex-1 py-1 text-xs border-b-2 {state.background.type === 'pattern' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500'}" on:click={() => handleBackground('pattern', 'dots')}>{dict.pattern}</button>
        </div>

        {#if state.background.type === 'color'}
            <div class="flex gap-2 items-center">
                <input type="color" value={state.background.value} on:input={(e) => handleBackground('color', e.currentTarget.value)} class="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                <input type="text" value={state.background.value} on:input={(e) => handleBackground('color', e.currentTarget.value)} class="flex-1 px-3 py-2 text-sm border rounded bg-slate-50" />
            </div>
        {:else if state.background.type === 'gradient'}
            <div class="grid grid-cols-4 gap-2">
                {#each gradients as grad}
                    <button
                        class="w-full h-8 rounded border border-slate-200 ring-2 ring-transparent hover:ring-indigo-300 transition-all"
                        style="background: {grad}"
                        on:click={() => handleBackground('gradient', grad)}
                        aria-label="Select Gradient"
                    ></button>
                {/each}
            </div>
        {:else if state.background.type === 'pattern'}
             <div class="grid grid-cols-3 gap-2">
                {#each patterns as pat}
                    <button
                        class="w-full py-2 rounded border border-slate-200 text-[10px] uppercase font-bold text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
                        on:click={() => handleBackground('pattern', pat)}
                    >
                        {pat}
                    </button>
                {/each}
            </div>
        {/if}
    </div>

    <!-- Selected Layer Properties -->
    {#if selectedLayer}
        <div class="space-y-4 pt-4 border-t border-slate-200">
            <div class="flex justify-between items-center">
                <h3 class="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                    {dict.textLayers}
                </h3>
                <button on:click={deleteLayer} class="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors" title={dict.history.delete}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
            </div>

            <!-- Position & Size -->
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="text-xs font-medium text-slate-600">{dict.layers.position} (X, Y)</label>
                    <div class="flex gap-2">
                        <input type="number" value={Math.round(selectedLayer.x)} on:input={(e) => updateLayer('x', e.currentTarget.value)} class="w-full px-2 py-2 text-sm border border-slate-300 rounded-lg" />
                        <input type="number" value={Math.round(selectedLayer.y)} on:input={(e) => updateLayer('y', e.currentTarget.value)} class="w-full px-2 py-2 text-sm border border-slate-300 rounded-lg" />
                    </div>
                </div>
                <div>
                    <label class="text-xs font-medium text-slate-600">{dict.width} / {dict.height}</label>
                    <div class="flex gap-2">
                        <input type="number" value={Math.round(selectedLayer.width)} on:input={(e) => updateLayer('width', e.currentTarget.value)} class="w-full px-2 py-2 text-sm border border-slate-300 rounded-lg" />
                        <input type="number" value={Math.round(selectedLayer.height)} on:input={(e) => updateLayer('height', e.currentTarget.value)} class="w-full px-2 py-2 text-sm border border-slate-300 rounded-lg" />
                    </div>
                </div>
            </div>

            <!-- Rotation -->
             <div>
                <label class="text-xs font-medium text-slate-600">{dict.layers.rotation}</label>
                <div class="flex gap-2 items-center">
                    <input type="range" min="-180" max="180" value={selectedLayer.rotation} on:input={(e) => updateLayer('rotation', e.currentTarget.value)} class="flex-1" />
                    <input type="number" value={selectedLayer.rotation} on:input={(e) => updateLayer('rotation', e.currentTarget.value)} class="w-16 px-2 py-2 text-sm border border-slate-300 rounded-lg text-center" />
                </div>
             </div>

            {#if selectedLayer.type === 'text'}
                <div class="space-y-2">
                    <label class="text-xs font-medium text-slate-600">{dict.layers.title}</label>
                    <textarea
                        value={selectedLayer.content}
                        on:input={(e) => updateLayer('content', e.currentTarget.value)}
                        class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        rows="3"
                    ></textarea>
                </div>

                <div class="grid grid-cols-2 gap-3">
                     <div>
                        <label class="text-xs font-medium text-slate-600">{dict.layers.size}</label>
                        <div class="relative">
                            <input type="text" value={selectedLayer.style.fontSize} on:change={(e) => updateLayer('fontSize', e.currentTarget.value)} class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" />
                        </div>
                     </div>
                     <div>
                        <label class="text-xs font-medium text-slate-600" for="layer-weight">{dict.layers.weight}</label>
                        <select id="layer-weight" value={selectedLayer.style.fontWeight} on:change={(e) => updateLayer('fontWeight', e.currentTarget.value)} class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg">
                            <option value="300">Light</option>
                            <option value="400">Regular</option>
                            <option value="500">Medium</option>
                            <option value="700">Bold</option>
                            <option value="900">Black</option>
                        </select>
                     </div>
                </div>

                <div>
                    <label class="text-xs font-medium text-slate-600" for="layer-color">{dict.layers.color}</label>
                    <div class="flex gap-2 mt-1">
                        <input id="layer-color" type="color" value={selectedLayer.style.color} on:input={(e) => updateLayer('color', e.currentTarget.value)} class="w-10 h-10 border-0 p-0 rounded cursor-pointer" />
                        <input aria-label="Hex color code" type="text" value={selectedLayer.style.color} on:change={(e) => updateLayer('color', e.currentTarget.value)} class="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg uppercase" />
                    </div>
                </div>

                <div>
                    <span class="text-xs font-medium text-slate-600 mb-1 block">{dict.layers.align}</span>
                    <div class="flex border border-slate-300 rounded-lg overflow-hidden" role="group" aria-label="Text Alignment">
                        <button aria-label="Align Left" class="flex-1 py-2 hover:bg-slate-50 flex justify-center {selectedLayer.style.textAlign === 'left' ? 'bg-slate-100 text-indigo-600' : 'text-slate-600'}" on:click={() => updateLayer('textAlign', 'left')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="17" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/></svg>
                        </button>
                        <div class="w-px bg-slate-300"></div>
                        <button aria-label="Align Center" class="flex-1 py-2 hover:bg-slate-50 flex justify-center {selectedLayer.style.textAlign === 'center' ? 'bg-slate-100 text-indigo-600' : 'text-slate-600'}" on:click={() => updateLayer('textAlign', 'center')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="17" x2="7" y1="12" y2="12"/><line x1="21" x2="3" y1="18" y2="18"/></svg>
                        </button>
                        <div class="w-px bg-slate-300"></div>
                        <button aria-label="Align Right" class="flex-1 py-2 hover:bg-slate-50 flex justify-center {selectedLayer.style.textAlign === 'right' ? 'bg-slate-100 text-indigo-600' : 'text-slate-600'}" on:click={() => updateLayer('textAlign', 'right')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="7" y1="6" y2="6"/><line x1="21" x2="3" y1="12" y2="12"/><line x1="21" x2="7" y1="18" y2="18"/></svg>
                        </button>
                    </div>
                </div>
            {:else if selectedLayer.type === 'image'}
                 <div class="space-y-2">
                    <label class="text-xs font-medium text-slate-600" for="layer-radius">{dict.layers.borderRadius}</label>
                    <input id="layer-radius" type="text" value={selectedLayer.style.borderRadius} on:change={(e) => updateLayer('borderRadius', e.currentTarget.value)} class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" placeholder="0px" />
                 </div>
            {/if}
        </div>
    {:else}
        <div class="pt-4 border-t border-slate-200 space-y-2">
            <button
                on:click={addTextLayer}
                class="w-full py-3 bg-white border-2 border-dashed border-indigo-300 text-indigo-600 rounded-xl hover:bg-indigo-50 hover:border-indigo-500 transition-all flex items-center justify-center gap-2 text-sm font-bold"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                {dict.addText}
            </button>
            <label class="w-full py-3 bg-white border-2 border-dashed border-indigo-300 text-indigo-600 rounded-xl hover:bg-indigo-50 hover:border-indigo-500 transition-all flex items-center justify-center gap-2 text-sm font-bold cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                {dict.upload}
                <input type="file" accept="image/*" class="hidden" on:change={handleImageUpload} />
            </label>
        </div>
    {/if}
</div>
