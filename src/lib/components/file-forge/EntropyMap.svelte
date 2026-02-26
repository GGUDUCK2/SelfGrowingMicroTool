<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';

  export let map: number[] = [];
  export let height = 120;
  export let mode: 'entropy' | 'byteClass' = 'entropy';

  const dispatch = createEventDispatcher();
  let canvas: HTMLCanvasElement;
  let hoveredOffset: number | null = null;

  $: if (map && canvas) {
    if (mode === 'entropy') {
        drawMap();
    } else {
        drawByteClassMap();
    }
  }

  $: if (mode && canvas) {
      if (mode === 'entropy') drawMap();
      else drawByteClassMap();
  }

  onMount(() => {
      if (map.length > 0) {
          if (mode === 'entropy') drawMap();
          else drawByteClassMap();
      }
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

  function drawByteClassMap() {
      // For byte class map, we need raw bytes, but here we only have chunk entropy or raw values.
      // If 'map' contains raw byte values (0-255), we can visualize classes.
      // However, the current component receives 'entropyMapData' which is 0-8 entropy values per chunk.
      // To support Byte Class visualization properly, we'd need to pass raw bytes or a different data structure.
      // Given the constraints, we will adapt this visualization to map the entropy values to classes if possible,
      // OR we assume that for 'byteClass' mode, 'map' represents something else (like byte frequency or distribution).

      // BUT, since we can't easily change the entire data flow without reading large files into memory,
      // let's stick to the current data structure.
      // If 'map' is entropy (0-8), we can visualize "Type" of data:
      // 0-3: Low (Text-like) -> Blue
      // 3-6: Mid (Code/Mixed) -> Yellow
      // 6-8: High (Compressed/Encrypted) -> Red

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const h = canvas.height;
      const barWidth = width / map.length;

      ctx.clearRect(0, 0, width, h);

      map.forEach((value, i) => {
          let color = '#3b82f6'; // Blue (Low)
          if (value > 7.5) color = '#ef4444'; // Red (High)
          else if (value > 5) color = '#eab308'; // Yellow (Mid)

          ctx.fillStyle = color;
          ctx.fillRect(i * barWidth, 0, Math.ceil(barWidth), h);
      });
  }

  function handleMouseMove(e: MouseEvent) {
      if (!canvas || map.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = x / rect.width;
      const index = Math.floor(ratio * map.length);

      if (index >= 0 && index < map.length) {
          hoveredOffset = index;
          dispatch('hover', { index, ratio });
      }
  }

  function handleMouseLeave() {
      hoveredOffset = null;
      dispatch('leave');
  }
</script>

<div
    class="relative w-full bg-slate-50 dark:bg-black/40 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 cursor-crosshair"
    style="height: {height}px"
    on:mousemove={handleMouseMove}
    on:mouseleave={handleMouseLeave}
    role="img"
    aria-label="Entropy visualization map"
>
  <canvas
    bind:this={canvas}
    width={800}
    height={height}
    class="w-full h-full block"
  ></canvas>
  <div class="absolute bottom-1 right-2 text-[10px] text-slate-400 font-mono pointer-events-none bg-black/50 px-1 rounded backdrop-blur-sm">
      {mode === 'entropy' ? 'ENTROPY DISTRIBUTION' : 'DATA TYPE DENSITY'}
  </div>
  {#if hoveredOffset !== null}
      <div
          class="absolute top-0 bottom-0 w-0.5 bg-white/80 pointer-events-none mix-blend-difference"
          style="left: {(hoveredOffset / map.length) * 100}%"
      ></div>
  {/if}
</div>
