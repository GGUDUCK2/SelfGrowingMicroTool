<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { BeatEvent, RhythmSettings } from '$lib/utils/rhythm-forge/types';

  export let lastBeat: BeatEvent | null = null;
  export let settings: RhythmSettings;
  export let mode: 'metronome' | 'trainer' = 'metronome';

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let frame: number;
  let width = 0;
  let height = 0;

  let pulses: Array<{
    type: 'primary' | 'secondary' | 'downbeat';
    createdAt: number;
    color: string;
  }> = [];

  $: if (lastBeat) {
      addPulse(lastBeat);
  }

  function addPulse(beat: BeatEvent) {
      // Add visual effect
      let color = '#6366f1'; // Indigo 500 (Primary)
      if (beat.type === 'downbeat') color = '#ec4899'; // Pink 500
      else if (beat.type === 'secondary') color = '#f59e0b'; // Amber 500

      pulses.push({
          type: beat.type,
          createdAt: performance.now(),
          color
      });
  }

  function resize() {
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
          width = rect.width;
          height = rect.height;
          // Handle DPI
          const dpr = window.devicePixelRatio || 1;
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          ctx.scale(dpr, dpr);
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;
      }
  }

  function draw() {
      if (!ctx || !canvas) return;
      const now = performance.now();
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Filter old pulses (500ms life)
      pulses = pulses.filter(p => now - p.createdAt < 500);

      // Draw Static Guides
      // Primary Ring (Inner)
      ctx.beginPath();
      ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
      ctx.strokeStyle = '#1e293b'; // Slate 800
      ctx.lineWidth = 4;
      ctx.stroke();

      // Secondary Ring (Outer) - Only if polyrhythm enabled
      if (settings.polyrhythmEnabled) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 4;
          ctx.stroke();
      }

      // Trainer Target Crosshair
      if (mode === 'trainer') {
          ctx.beginPath();
          ctx.moveTo(centerX - 10, centerY);
          ctx.lineTo(centerX + 10, centerY);
          ctx.moveTo(centerX, centerY - 10);
          ctx.lineTo(centerX, centerY + 10);
          ctx.strokeStyle = '#4ade80'; // Green 400
          ctx.lineWidth = 2;
          ctx.stroke();

          // Target Circle
          ctx.beginPath();
          ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
          ctx.strokeStyle = '#4ade80';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.stroke();
          ctx.setLineDash([]);
      }

      // Draw Pulses
      pulses.forEach(p => {
          const age = now - p.createdAt;
          const progress = age / 400; // Animation speed
          const alpha = Math.max(0, 1 - progress);

          ctx.beginPath();
          let radius = 40; // Default Primary

          if (p.type === 'secondary') {
              radius = 80;
          }

          // "Explosion" effect
          const currentRadius = radius + (progress * 30);

          ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);

          // Fill
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha * 0.3;
          ctx.fill();

          // Stroke
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 4;
          ctx.stroke();

          // Flash center for downbeat
          if (p.type === 'downbeat') {
              ctx.beginPath();
              ctx.arc(centerX, centerY, 20 * (1-progress), 0, Math.PI * 2);
              ctx.fillStyle = '#fff';
              ctx.globalAlpha = alpha * 0.8;
              ctx.fill();
          }
      });

      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
  }

  onMount(() => {
      ctx = canvas.getContext('2d')!;
      resize();
      window.addEventListener('resize', resize);
      draw();
  });

  onDestroy(() => {
      if (typeof window !== 'undefined') {
          window.removeEventListener('resize', resize);
          cancelAnimationFrame(frame);
      }
  });
</script>

<div class="w-full h-64 md:h-80 flex items-center justify-center bg-slate-950 rounded-3xl shadow-2xl overflow-hidden border border-slate-900 relative">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-950 to-slate-950 pointer-events-none"></div>
    <canvas
        bind:this={canvas}
        class="w-full h-full relative z-10"
    ></canvas>

    <!-- Center Label -->
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
       <span class="text-4xl font-bold text-slate-700">{settings.signature[0]}</span>
       {#if settings.polyrhythmEnabled && settings.polyrhythm}
         <span class="text-2xl text-slate-600 mx-2">:</span>
         <span class="text-4xl font-bold text-slate-700">{settings.polyrhythm[0]}</span>
       {/if}
    </div>
</div>
