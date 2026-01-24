<script lang="ts">
  import type { LogEntry } from '$lib/utils/log-prism/types';
  import { onMount } from 'svelte';

  export let entries: LogEntry[] = [];
  export let timeRange: { start: number, end: number } | null = null;
  export let onSelectTime: (start: number, end: number) => void;

  let canvas: HTMLCanvasElement;
  let container: HTMLDivElement;

  $: if (entries && canvas && container) {
      draw();
  }

  function draw() {
    if (!entries.length || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = container.clientWidth;
    const height = 64; // Fixed height for timeline bar

    // Handle HiDPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Calculate buckets
    const timestamps = entries.map(e => e.timestamp?.getTime()).filter(t => t) as number[];
    if (timestamps.length === 0) return;

    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const duration = maxTime - minTime;

    if (duration === 0) return;

    const bucketCount = Math.min(width / 4, 100); // approx 4px per bucket
    const bucketSize = duration / bucketCount;
    const buckets = new Array(bucketCount).fill(0).map(() => ({ error: 0, warn: 0, info: 0 }));

    entries.forEach(e => {
        if (!e.timestamp) return;
        const time = e.timestamp.getTime();
        const bucketIndex = Math.min(Math.floor((time - minTime) / bucketSize), bucketCount - 1);
        if (bucketIndex >= 0) {
            if (e.level === 'error') buckets[bucketIndex].error++;
            else if (e.level === 'warn') buckets[bucketIndex].warn++;
            else buckets[bucketIndex].info++;
        }
    });

    const maxCount = Math.max(...buckets.map(b => b.error + b.warn + b.info));
    const scaleY = (height - 4) / (maxCount || 1);

    // Draw
    ctx.clearRect(0, 0, width, height);

    const barWidth = width / bucketCount;

    buckets.forEach((b, i) => {
        const x = i * barWidth;
        const totalH = (b.error + b.warn + b.info) * scaleY;
        const errorH = b.error * scaleY;
        const warnH = b.warn * scaleY;
        // const infoH = b.info * scaleY;

        // Draw Info base
        ctx.fillStyle = '#cbd5e1'; // slate-300
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) ctx.fillStyle = '#475569';
        ctx.fillRect(x, height - totalH, barWidth - 1, totalH);

        // Draw Warn
        if (warnH > 0) {
            ctx.fillStyle = '#facc15'; // yellow-400
            ctx.fillRect(x, height - (errorH + warnH), barWidth - 1, warnH);
        }

        // Draw Error
        if (errorH > 0) {
            ctx.fillStyle = '#ef4444'; // red-500
            ctx.fillRect(x, height - errorH, barWidth - 1, errorH);
        }
    });
  }

  function handleClick(e: MouseEvent) {
      if (!entries.length) return;
      // Simple logic to find time range of clicked bucket
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;

      const timestamps = entries.map(e => e.timestamp?.getTime()).filter(t => t) as number[];
      const minTime = Math.min(...timestamps);
      const maxTime = Math.max(...timestamps);
      const bucketCount = Math.min(width / 4, 100);
      const bucketSize = (maxTime - minTime) / bucketCount;

      const bucketIndex = Math.floor((x / width) * bucketCount);
      const start = minTime + bucketIndex * bucketSize;
      const end = start + bucketSize;

      onSelectTime(start, end);
  }

  onMount(() => {
      window.addEventListener('resize', draw);
      return () => window.removeEventListener('resize', draw);
  });
</script>

<div class="w-full" bind:this={container}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <canvas bind:this={canvas} class="w-full cursor-crosshair rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800" on:click={handleClick}></canvas>
</div>
