<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';

  export let buffer: AudioBuffer | null = null;
  export let selectionStart: number = 0;
  export let selectionEnd: number = 0;
  export let currentTime: number = 0;
  export let zoom: number = 100; // pixels per second (not used in this simple version, we fit to width)
  export let height: number = 200;

  let canvas: HTMLCanvasElement;
  let container: HTMLDivElement;
  let ctx: CanvasRenderingContext2D | null = null;
  let isSelecting = false;

  $: if (buffer && canvas) {
    draw();
  }

  $: if (currentTime && canvas) {
      draw(); // Redraw to show playhead
  }

  $: if ((selectionStart || selectionEnd) && canvas) {
      draw();
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  });

  function resize() {
    if (!container || !canvas) return;
    canvas.width = container.clientWidth;
    canvas.height = height;
    draw();
  }

  function draw() {
    if (!ctx || !canvas) return;
    const width = canvas.width;
    const h = canvas.height;

    // Clear
    ctx.fillStyle = '#1e293b'; // slate-800
    ctx.fillRect(0, 0, width, h);

    if (!buffer) {
        // Draw empty state line
        ctx.beginPath();
        ctx.strokeStyle = '#334155';
        ctx.moveTo(0, h/2);
        ctx.lineTo(width, h/2);
        ctx.stroke();
        return;
    }

    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = h / 2;

    ctx.fillStyle = '#6366f1'; // indigo-500
    ctx.beginPath();

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;

      // Optimization: don't loop too much for huge files if zoomed out
      const calculatedStep = Math.max(1, step);

      for (let j = 0; j < calculatedStep; j++) {
        const idx = (i * calculatedStep) + j;
        if (idx < data.length) {
            const datum = data[idx];
            if (datum < min) min = datum;
            if (datum > max) max = datum;
        }
      }

      // Draw bar
      // Center is h/2.
      // 0 => h/2
      // 1 => h
      // -1 => 0

      // Actually simpler:
      // y = (1 - datum) * amp; ?? No.
      // datum is -1 to 1.
      // y = (datum + 1) * amp. (0 to h).
      // But standard is center 0.

      // Rect top: (1 - max) * amp
      // Rect height: (max - min) * amp

      // Let's ensure we see something
      if (max < min) { max = 0; min = 0; } // Silence

      const y = (1 - max) * amp;
      const barHeight = Math.max(1, (max - min) * amp);

      ctx.fillRect(i, y, 1, barHeight);
    }

    // Draw selection
    if (selectionEnd > selectionStart) {
        const startX = (selectionStart / buffer.duration) * width;
        const endX = (selectionEnd / buffer.duration) * width;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(startX, 0, endX - startX, h);
    }

    // Draw Playhead
    const playheadX = (currentTime / buffer.duration) * width;
    ctx.fillStyle = '#ef4444'; // red-500
    ctx.fillRect(playheadX, 0, 2, h);
  }

  function handleMouseDown(e: MouseEvent) {
      if (!buffer) return;
      isSelecting = true;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const t = (x / canvas.width) * buffer.duration;
      selectionStart = t;
      selectionEnd = t;
  }

  function handleMouseMove(e: MouseEvent) {
      if (!isSelecting || !buffer) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, canvas.width));
      const t = (x / canvas.width) * buffer.duration;
      selectionEnd = t;
  }

  function handleMouseUp() {
      isSelecting = false;
      // Ensure start < end
      if (selectionStart > selectionEnd) {
          const temp = selectionStart;
          selectionStart = selectionEnd;
          selectionEnd = temp;
      }
  }

</script>

<div
  bind:this={container}
  class="w-full relative cursor-crosshair select-none"
  on:mousedown={handleMouseDown}
  on:mousemove={handleMouseMove}
  on:mouseup={handleMouseUp}
  on:mouseleave={handleMouseUp}
>
    <canvas
        bind:this={canvas}
        class="block w-full rounded-lg"
        style="height: {height}px;"
    ></canvas>
</div>
