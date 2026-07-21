<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  export let stops: { color: string; position: number }[] = [];
  export let t: any;

  const dispatch = createEventDispatcher();
  let sliderRef: HTMLDivElement;
  let activeStopIndex: number | null = null;
  let isDragging = false;

  function handleTrackClick(e: MouseEvent) {
    if (!sliderRef || isDragging) return;
    const rect = sliderRef.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));

    // Add new stop
    const newStop = { color: '#8b5cf6', position: Math.round(percent) };
    const newStops = [...stops, newStop].sort((a, b) => a.position - b.position);
    dispatch('update', newStops);
  }

  function startDrag(index: number, e: MouseEvent | TouchEvent) {
    e.stopPropagation();
    activeStopIndex = index;
    isDragging = true;

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!sliderRef || activeStopIndex === null) return;
      const clientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const rect = sliderRef.getBoundingClientRect();
      const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));

      const newStops = [...stops];
      newStops[activeStopIndex].position = Math.round(percent);
      dispatch('update', newStops.sort((a, b) => a.position - b.position));
    };

    const handleEnd = () => {
      activeStopIndex = null;
      setTimeout(() => isDragging = false, 50);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);
  }

  function removeStop(index: number) {
    if (stops.length <= 2) return;
    const newStops = stops.filter((_, i) => i !== index);
    dispatch('update', newStops);
  }

  function updateColor(index: number, color: string) {
    const newStops = [...stops];
    newStops[index].color = color;
    dispatch('update', newStops);
  }

  $: cssGradient = `linear-gradient(to right, ${stops.map(s => `${s.color} ${s.position}%`).join(', ')})`;
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.stops}</label>
  </div>

  <!-- Slider Track -->
  <div
    bind:this={sliderRef}
    class="relative h-10 rounded-xl cursor-crosshair border border-slate-200 dark:border-slate-700 shadow-sm"
    style="background: {cssGradient}; background-image: {cssGradient}, url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\"><rect width=\"10\" height=\"10\" fill=\"%23ddd\"/><rect x=\"10\" width=\"10\" height=\"10\" fill=\"%23fff\"/><rect y=\"10\" width=\"10\" height=\"10\" fill=\"%23fff\"/><rect x=\"10\" y=\"10\" width=\"10\" height=\"10\" fill=\"%23ddd\"/></svg>'); background-blend-mode: normal;"
    on:click={handleTrackClick}
    role="slider"
    aria-label="Gradient color stops"
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={50}
    tabindex="0"
    on:keydown={(e) => {
      if (e.key === 'Enter') {
        const newStop = { color: '#8b5cf6', position: 50 };
        const newStops = [...stops, newStop].sort((a, b) => a.position - b.position);
        dispatch('update', newStops);
      }
    }}
  >
    {#each stops as stop, index (stop.color + "_" + index)}
      <button
        class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-8 bg-white border-2 border-slate-300 rounded shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-indigo-500 z-10"
        style="left: {stop.position}%; background-color: {stop.color};"
        on:mousedown={(e) => startDrag(index, e)}
        on:touchstart|passive={(e) => startDrag(index, e)}
        title="Drag to move, click color picker below to change"
        aria-label="Color stop at {stop.position}%"
      ></button>
    {/each}
  </div>

  <!-- Stops List Editor -->
  <div class="space-y-3 mt-4">
    {#each stops as stop, index}
      <div class="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
        <!-- Color Picker -->
        <input
          type="color"
          value={stop.color}
          on:input={(e) => updateColor(index, e.currentTarget.value)}
          class="w-10 h-10 rounded cursor-pointer border border-slate-300 dark:border-slate-600 bg-transparent min-h-[44px] min-w-[44px]"
          aria-label="Stop color"
        />

        <!-- Hex Input -->
        <input
          type="text"
          value={stop.color}
          on:input={(e) => updateColor(index, e.currentTarget.value)}
          class="flex-1 w-24 p-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase font-mono min-h-[44px]"
        />

        <!-- Position Input -->
        <div class="relative flex-1">
          <input
            type="number"
            min="0"
            max="100"
            bind:value={stop.position}
            on:change={() => {
               stops = [...stops].sort((a, b) => a.position - b.position);
               dispatch('update', stops);
            }}
            class="w-full p-2 pr-6 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono min-h-[44px]"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
        </div>

        <!-- Remove Button -->
        <button
          class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-400"
          on:click={() => removeStop(index)}
          disabled={stops.length <= 2}
          aria-label="Remove stop"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
        </button>
      </div>
    {/each}
  </div>
</div>
