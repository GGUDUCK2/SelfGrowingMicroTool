<script lang="ts">
  import { onMount } from 'svelte';

  export let map: number[] = [];
  export let height = 120;

  let canvas: HTMLCanvasElement;

  $: if (map && canvas) {
    drawMap();
  }

  onMount(() => {
      if (map.length > 0) drawMap();
  });

  function drawMap() {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const h = canvas.height;
    // Ensure we fill the width
    const barWidth = width / map.length;

    ctx.clearRect(0, 0, width, h);

    map.forEach((value, i) => {
      // Entropy is 0-8
      // Map to color: Low (0) -> Green, High (8) -> Red
      // Hue: 120 (Green) -> 0 (Red)
      const hue = Math.max(0, 120 - (value / 8) * 120);

      // Saturation 80%, Lightness 50%
      ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;

      // Height proportional to entropy
      const barHeight = Math.max(2, (value / 8) * h);
      const x = i * barWidth;
      const y = h - barHeight;

      // Use slightly overlapping rects to avoid anti-aliasing gaps
      ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(barWidth), Math.ceil(barHeight));
    });

    // Draw baseline
    ctx.fillStyle = '#334155'; // Slate 700
    ctx.fillRect(0, h - 1, width, 1);
  }
</script>

<div class="relative w-full bg-slate-50 dark:bg-black/40 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800" style="height: {height}px">
  <canvas
    bind:this={canvas}
    width={800}
    height={height}
    class="w-full h-full block"
  />
  <div class="absolute bottom-1 right-2 text-[10px] text-slate-400 font-mono pointer-events-none">
      ENTROPY DISTRIBUTION
  </div>
</div>
