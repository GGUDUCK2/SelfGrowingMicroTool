<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { BeatEvent, RhythmSettings } from '$lib/utils/rhythm-forge/types';
  import type { MetronomeEngine } from '$lib/utils/rhythm-forge/audio';

  export let engine: MetronomeEngine;
  export let lastBeat: BeatEvent | null = null;
  export let settings: RhythmSettings;
  export let mode: 'metronome' | 'trainer' | 'game' = 'metronome';

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
      let color = '#6366f1'; // Indigo 500
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
      const maxRadius = Math.min(width, height) / 2 - 20;

      ctx.clearRect(0, 0, width, height);

      // Radar / Clock Logic
      if (engine && settings.isPlaying) {
          const currentTime = engine.getCurrentTime();
          const spb = 60 / settings.bpm;
          const barDuration = spb * settings.signature[0];

          // Phase 0..1 representing position in the measure
          const phase = (currentTime % barDuration) / barDuration;
          const angle = phase * Math.PI * 2 - Math.PI / 2; // Start at 12 o'clock

          // Draw Primary Markers (Outer Ring)
          const primaryCount = settings.signature[0];
          const primaryRadius = maxRadius * 0.8;

          ctx.beginPath();
          ctx.arc(centerX, centerY, primaryRadius, 0, Math.PI * 2);
          ctx.strokeStyle = '#334155'; // Slate 700
          ctx.lineWidth = 2;
          ctx.stroke();

          for (let i = 0; i < primaryCount; i++) {
              const a = (i / primaryCount) * Math.PI * 2 - Math.PI / 2;
              const x = centerX + Math.cos(a) * primaryRadius;
              const y = centerY + Math.sin(a) * primaryRadius;

              ctx.beginPath();
              ctx.arc(x, y, i === 0 ? 6 : 4, 0, Math.PI * 2);
              ctx.fillStyle = i === 0 ? '#ec4899' : '#6366f1';
              ctx.fill();
          }

          // Draw Secondary Markers (Inner Ring) - Polyrhythm
          if (settings.polyrhythmEnabled && settings.polyrhythm) {
              const secondaryCount = settings.polyrhythm[0];
              const secondaryRadius = maxRadius * 0.55;

              ctx.beginPath();
              ctx.arc(centerX, centerY, secondaryRadius, 0, Math.PI * 2);
              ctx.strokeStyle = '#334155';
              ctx.lineWidth = 2;
              ctx.stroke();

              for (let i = 0; i < secondaryCount; i++) {
                  const a = (i / secondaryCount) * Math.PI * 2 - Math.PI / 2;
                  const x = centerX + Math.cos(a) * secondaryRadius;
                  const y = centerY + Math.sin(a) * secondaryRadius;

                  ctx.beginPath();
                  ctx.arc(x, y, 4, 0, Math.PI * 2);
                  ctx.fillStyle = '#f59e0b';
                  ctx.fill();
              }
          }

          // Draw Hand
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(centerX + Math.cos(angle) * maxRadius * 0.9, centerY + Math.sin(angle) * maxRadius * 0.9);
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          ctx.shadowColor = '#6366f1';
          ctx.shadowBlur = 10;
          ctx.stroke();
          ctx.shadowBlur = 0; // Reset shadow
      } else {
          // Idle State - Just faint rings
          ctx.beginPath();
          ctx.arc(centerX, centerY, maxRadius * 0.8, 0, Math.PI * 2);
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 2;
          ctx.stroke();
      }

      // Draw Pulses (Feedback from engine beat events)
      pulses = pulses.filter(p => now - p.createdAt < 600);
      pulses.forEach(p => {
          const age = now - p.createdAt;
          const progress = age / 600;
          const alpha = 1 - Math.pow(progress, 3); // Fade out

          let radius = maxRadius * 0.8;
          if (p.type === 'secondary') radius = maxRadius * 0.55;

          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 10 * alpha;
          ctx.globalAlpha = alpha;
          ctx.stroke();
          ctx.globalAlpha = 1;
      });

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
