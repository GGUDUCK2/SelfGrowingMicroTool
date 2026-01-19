<script lang="ts">
  import { onMount } from 'svelte';
  import { Eraser, PenTool, MousePointer2 } from 'lucide-svelte';

  export let dict: any;
  export let onLog: (event: any) => void;

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let rect: DOMRect;

  let currentInfo = {
    pressure: 0,
    tiltX: 0,
    tiltY: 0,
    type: '-',
    width: 0,
    height: 0,
    buttons: 0
  };

  onMount(() => {
    if (canvas) {
        ctx = canvas.getContext('2d')!;
        resize();
        window.addEventListener('resize', resize);
    }
    return () => {
        if (typeof window !== 'undefined') window.removeEventListener('resize', resize);
    }
  });

  function resize() {
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (parent) {
          canvas.width = parent.clientWidth;
          canvas.height = 400; // Fixed height
          rect = canvas.getBoundingClientRect();
      }
  }

  function handlePointer(e: PointerEvent) {
      e.preventDefault(); // Prevent scrolling on touch

      // Update info
      currentInfo = {
          pressure: e.pressure,
          tiltX: e.tiltX,
          tiltY: e.tiltY,
          type: e.pointerType,
          width: e.width,
          height: e.height,
          buttons: e.buttons
      };

      if (e.type === 'pointerdown' || (e.type === 'pointermove' && e.buttons > 0)) {
          draw(e);
      }

      if (e.type === 'pointerdown' || e.type === 'pointerup') {
          onLog({
              type: 'pointer',
              detail: `${e.type} (${e.pointerType})`,
              pressure: e.pressure.toFixed(2),
              time: new Date()
          });
      }
  }

  function draw(e: PointerEvent) {
      if (!ctx) return;

      // Rect might need update if scrolled
      rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const pressure = e.pressure === 0 && e.pointerType === 'mouse' ? 0.5 : e.pressure; // Mock pressure for mouse

      ctx.beginPath();
      ctx.arc(x, y, (pressure * 10) + 2, 0, Math.PI * 2);

      if (e.pointerType === 'pen') {
           ctx.fillStyle = `hsl(${Math.abs(e.tiltX) + Math.abs(e.tiltY)}, 70%, 50%)`;
      } else if (e.pointerType === 'touch') {
           ctx.fillStyle = 'rgba(244, 63, 94, 0.5)'; // Rose
      } else {
           ctx.fillStyle = 'rgba(99, 102, 241, 0.5)'; // Indigo
      }

      ctx.fill();
  }

  function clear() {
      if (ctx && canvas) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
  }
</script>

<div class="space-y-6">
    <!-- Stats Bar -->
    <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div class="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div class="text-[10px] uppercase text-slate-500 font-bold mb-1">{dict.pointer.pressure}</div>
            <div class="font-mono text-xl font-bold text-indigo-600 dark:text-indigo-400">{currentInfo.pressure.toFixed(3)}</div>
        </div>
        <div class="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div class="text-[10px] uppercase text-slate-500 font-bold mb-1">{dict.pointer.tiltX}</div>
            <div class="font-mono text-xl font-bold text-slate-700 dark:text-slate-300">{currentInfo.tiltX}°</div>
        </div>
        <div class="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div class="text-[10px] uppercase text-slate-500 font-bold mb-1">{dict.pointer.tiltY}</div>
            <div class="font-mono text-xl font-bold text-slate-700 dark:text-slate-300">{currentInfo.tiltY}°</div>
        </div>
        <div class="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div class="text-[10px] uppercase text-slate-500 font-bold mb-1">{dict.pointer.type}</div>
            <div class="font-bold text-lg capitalize flex items-center justify-center gap-2">
                {#if currentInfo.type === 'mouse'} <MousePointer2 size={16}/>
                {:else if currentInfo.type === 'pen'} <PenTool size={16}/>
                {:else} <span class="text-sm">{currentInfo.type}</span> {/if}
            </div>
        </div>
         <div class="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div class="text-[10px] uppercase text-slate-500 font-bold mb-1">{dict.pointer.width}</div>
            <div class="font-mono text-xl font-bold text-slate-700 dark:text-slate-300">{currentInfo.width.toFixed(1)}</div>
        </div>
         <div class="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div class="text-[10px] uppercase text-slate-500 font-bold mb-1">{dict.pointer.buttons}</div>
            <div class="font-mono text-xl font-bold text-slate-700 dark:text-slate-300">{currentInfo.buttons}</div>
        </div>
    </div>

    <!-- Canvas -->
    <div class="relative bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm touch-none">
        <canvas
            bind:this={canvas}
            on:pointerdown={handlePointer}
            on:pointermove={handlePointer}
            on:pointerup={handlePointer}
            on:pointercancel={handlePointer}
            on:pointerout={handlePointer}
            class="w-full cursor-crosshair touch-none"
        ></canvas>
        <div class="absolute top-4 left-4 pointer-events-none text-slate-400 text-sm select-none bg-white/80 dark:bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm">
            {dict.pointer.draw}
        </div>
        <button
            on:click={clear}
            class="absolute top-4 right-4 p-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors shadow-sm border border-slate-200 dark:border-slate-700"
            aria-label="Clear Canvas"
        >
            <Eraser size={20} />
        </button>
    </div>
</div>
