<script lang="ts">
    import { onMount } from 'svelte';
    import { engine } from '$lib/utils/zen-forge/engine';

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let frame: number;
    let time = 0;

    const colors: Record<string, string> = {
        rain: '#3b82f6', // blue-500
        wind: '#94a3b8', // slate-400
        white: '#e2e8f0', // slate-200
        pink: '#f472b6', // pink-400
        brown: '#a16207', // yellow-800
        drone: '#6366f1', // indigo-500
        binaural_alpha: '#10b981', // emerald-500
        binaural_theta: '#8b5cf6', // violet-500
        binaural_delta: '#3b82f6'  // blue-500
    };

    function draw() {
        if (!canvas || !ctx) return;

        if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        }

        const w = canvas.width;
        const h = canvas.height;
        time += 0.005;

        // Clear with fade for trails
        ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
        ctx.fillRect(0, 0, w, h);

        const active = Array.from(engine.channels.entries());
        if (active.length === 0) {
             frame = requestAnimationFrame(draw);
             return;
        }

        active.forEach(([id, ch], i) => {
            const vol = ch.gain.gain.value;
            if (vol < 0.01) return;

            const color = colors[id] || '#ffffff';
            // Move around
            const x = (Math.sin(time * 0.5 + i) * 0.3 + 0.5) * w;
            const y = (Math.cos(time * 0.3 + i * 1.5) * 0.3 + 0.5) * h;

            // Pulse size
            const radius = Math.min(w, h) * (0.2 + vol * 0.4 + Math.sin(time * 2 + i) * 0.05);

            const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
            grad.addColorStop(0, color + '40'); // 25% opacity
            grad.addColorStop(1, color + '00'); // 0%

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        });

        frame = requestAnimationFrame(draw);
    }

    onMount(() => {
        ctx = canvas.getContext('2d')!;
        frame = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(frame);
    });
</script>

<canvas bind:this={canvas} class="absolute inset-0 w-full h-full -z-10 opacity-60 pointer-events-none"></canvas>
