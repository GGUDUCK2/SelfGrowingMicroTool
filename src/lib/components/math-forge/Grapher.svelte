<script lang="ts">
  import { onMount } from 'svelte';
  import { MathEngine } from '$lib/utils/math-forge/engine';
  import { Plus, X, RefreshCw } from 'lucide-svelte';

  export let dict: any;
  const engine = new MathEngine();

  let functions = [{ color: '#4f46e5', expression: 'sin(x)' }];
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let width = 600;
  let height = 400;

  // Viewport
  let scale = 40; // pixels per unit
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;

  $: if (canvas && functions && width) draw();

  function resize() {
      if (canvas && canvas.parentElement) {
          width = canvas.parentElement.clientWidth;
          height = 400;
          draw();
      }
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2 + offsetX;
    const centerY = height / 2 + offsetY;

    // Grid
    ctx.beginPath();
    ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#334155' : '#e2e8f0';
    ctx.lineWidth = 1;

    // Optimized grid loop
    const startX = (centerX % scale);
    for (let x = startX; x < width; x += scale) {
        ctx.moveTo(x, 0); ctx.lineTo(x, height);
    }
    const startY = (centerY % scale);
    for (let y = startY; y < height; y += scale) {
        ctx.moveTo(0, y); ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Axes
    ctx.beginPath();
    ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b';
    ctx.lineWidth = 2;
    ctx.moveTo(0, centerY); ctx.lineTo(width, centerY);
    ctx.moveTo(centerX, 0); ctx.lineTo(centerX, height);
    ctx.stroke();

    // Functions
    functions.forEach(fn => {
      if (!fn.expression) return;
      ctx.beginPath();
      ctx.strokeStyle = fn.color;
      ctx.lineWidth = 2;
      let started = false;

      // Plot with higher resolution if needed? pixel step is fine.
      for (let px = 0; px < width; px++) {
        const x = (px - centerX) / scale;
        try {
          // -y because canvas Y is down
          const y = engine.evaluate(fn.expression, { x });
          const py = centerY - y * scale;

          if (isFinite(py)) {
             // Avoid drawing lines across infinity/asymptotes abruptly
             // If jump is too large, break
             if (started) {
                 ctx.lineTo(px, py);
             } else {
                 ctx.moveTo(px, py);
                 started = true;
             }
          } else {
             started = false;
          }
        } catch (e) {
            started = false;
        }
      }
      ctx.stroke();
    });
  }

  function handleWheel(e: WheelEvent) {
      e.preventDefault();
      const zoom = e.deltaY > 0 ? 0.9 : 1.1;
      scale *= zoom;
      draw();
  }

  function addFunction() {
      const colors = ['#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
      functions = [...functions, { color: colors[functions.length % colors.length], expression: '' }];
  }

  function removeFunction(i: number) {
      functions = functions.filter((_, idx) => idx !== i);
  }

  onMount(() => {
      ctx = canvas.getContext('2d')!;
      resize();
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
  });
</script>

<div class="flex flex-col gap-4">
  <div class="relative bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-200 dark:border-slate-700 overflow-hidden cursor-move touch-none"
       style="height: 400px;"
       role="application"
       tabindex="0"
       aria-label="Graphing Canvas"
       on:mousedown={(e) => { isDragging = true; lastX = e.clientX; lastY = e.clientY; }}
       on:mousemove={(e) => {
           if (isDragging) {
               offsetX += e.clientX - lastX;
               offsetY += e.clientY - lastY;
               lastX = e.clientX;
               lastY = e.clientY;
               draw();
           }
       }}
       on:mouseup={() => isDragging = false}
       on:mouseleave={() => isDragging = false}
       on:wheel={handleWheel}
  >
      <canvas bind:this={canvas} {width} {height} class="block"></canvas>
      <button class="absolute top-2 right-2 p-2 min-h-[44px] min-w-[44px] bg-white/80 dark:bg-slate-800/80 rounded shadow backdrop-blur-sm transition-colors hover:bg-white dark:hover:bg-slate-700 flex justify-center items-center"
              on:click={() => { offsetX=0; offsetY=0; scale=40; draw(); }}
              title={dict.reset}>
          <RefreshCw size={16} class="text-slate-600 dark:text-slate-300" />
      </button>
  </div>

  <div class="space-y-2">
      {#each functions as fn, i}
          <div class="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-200 dark:border-slate-700 min-h-[44px]">
              <div class="w-3 h-3 rounded-full shrink-0" style="background-color: {fn.color}"></div>
              <span class="text-xs font-mono text-slate-500 hidden sm:inline">{dict.function}</span>
              <input type="text" aria-label="Function Expression {i+1}" bind:value={fn.expression} on:input={draw} class="flex-1 min-h-[44px] bg-transparent border-none outline-none font-mono text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400" placeholder="e.g. sin(x)" />
              <button on:click={() => removeFunction(i)} aria-label="Remove Function {i+1}" class="p-1 min-h-[44px] min-w-[44px] text-slate-400 hover:text-red-500 rounded flex justify-center items-center"><X size={14} /></button>
          </div>
      {/each}
      <button on:click={addFunction} class="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium px-2 py-1 min-h-[44px] hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded w-full justify-center border-2 border-dashed border-indigo-200 dark:border-indigo-900">
          <Plus size={16} /> {dict.addFunction}
      </button>
  </div>
</div>
