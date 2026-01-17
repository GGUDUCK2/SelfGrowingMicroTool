<script lang="ts">
  export let originalUrl: string;
  export let optimizedUrl: string;
  export let labelOriginal: string = "Original";
  export let labelOptimized: string = "Optimized";

  let sliderValue = 50;
</script>

<div class="relative w-full h-full select-none overflow-hidden bg-slate-900 group">
  <!-- Optimized Image (Bottom Layer) -->
  <img
    src={optimizedUrl}
    alt="Optimized"
    class="absolute inset-0 w-full h-full object-contain pointer-events-none"
  />
  <div class="absolute top-2 right-2 px-2 py-1 bg-black/60 rounded text-[10px] text-green-400 font-bold backdrop-blur-sm pointer-events-none z-10">
    {labelOptimized}
  </div>

  <!-- Original Image (Top Layer) -->
  <img
    src={originalUrl}
    alt="Original"
    class="absolute inset-0 w-full h-full object-contain pointer-events-none"
    style="clip-path: polygon(0 0, {sliderValue}% 0, {sliderValue}% 100%, 0 100%);"
  />
  <div
    class="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-[10px] text-white font-bold backdrop-blur-sm pointer-events-none z-10"
    style="opacity: {sliderValue < 15 ? 0 : 1}; transition: opacity 0.2s;"
  >
    {labelOriginal}
  </div>

  <!-- Slider Handle -->
  <div
    class="absolute top-0 bottom-0 w-0.5 bg-indigo-500 cursor-ew-resize z-20 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
    style="left: {sliderValue}%;"
  >
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><polyline points="15 18 9 12 15 6"></polyline></svg>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white absolute"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </div>
  </div>

  <!-- Range Input (Invisible overlay for interaction) -->
  <input
    type="range"
    min="0"
    max="100"
    bind:value={sliderValue}
    class="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 m-0 p-0"
    aria-label="Comparison slider"
  />
</div>
