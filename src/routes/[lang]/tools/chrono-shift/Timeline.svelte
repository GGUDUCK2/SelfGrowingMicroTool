<script lang="ts">
    import { onMount } from 'svelte';
    import { addMinutes, startOfDay, addDays, format } from 'date-fns';

    export let value: Date; // Controlled UTC Date
    export let onChange: (d: Date) => void;

    let container: HTMLDivElement;
    let isDragging = false;

    // We display a 48-hour window centered loosely around the current time
    // but simplified: Let's do a 24-hour slider that modifies the TIME component of the date
    // and a date picker elsewhere.

    // Actually, a continuous slider is better.
    // Let's render 24 hours ticks.

    function handleMouseDown(e: MouseEvent) {
        isDragging = true;
        updateTimeFromEvent(e);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }

    function handleMouseMove(e: MouseEvent) {
        if (!isDragging) return;
        updateTimeFromEvent(e);
    }

    function handleMouseUp() {
        isDragging = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }

    function handleTouchStart(e: TouchEvent) {
        isDragging = true;
        updateTimeFromEvent(e);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);
    }

    function handleTouchMove(e: TouchEvent) {
        if (!isDragging) return;
        e.preventDefault(); // Prevent scrolling while dragging
        updateTimeFromEvent(e);
    }

    function handleTouchEnd() {
        isDragging = false;
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
    }

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            onChange(addMinutes(value, -15));
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            onChange(addMinutes(value, 15));
        }
    }

    function updateTimeFromEvent(e: MouseEvent | TouchEvent) {
        if (!container) return;
        const rect = container.getBoundingClientRect();

        let clientX;
        if (window.TouchEvent && e instanceof TouchEvent) {
             clientX = e.touches[0].clientX;
        } else {
             clientX = (e as MouseEvent).clientX;
        }

        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percentage = x / rect.width;

        // Map percentage to 0-24 hours
        const totalMinutes = percentage * 24 * 60;

        const currentLocal = new Date(value);
        currentLocal.setHours(0, 0, 0, 0);
        const target = addMinutes(currentLocal, totalMinutes);

        onChange(target);
    }

    // Calculate handle position
    $: getHandlePosition = () => {
        const h = value.getHours();
        const m = value.getMinutes();
        const minutes = h * 60 + m;
        return (minutes / (24 * 60)) * 100;
    };

    // Generate ticks
    const ticks = Array.from({ length: 25 }, (_, i) => i);
</script>

<div
    bind:this={container}
    class="relative h-14 mt-4 w-full cursor-col-resize select-none touch-none focus:outline-none group z-0"
    on:mousedown={handleMouseDown}
    on:touchstart|passive={handleTouchStart}
    on:keydown={handleKeyDown}
    role="slider"
    aria-valuenow={getHandlePosition()}
    aria-valuemin="0"
    aria-valuemax="100"
    tabindex="0"
    aria-label="Time Slider"
>
    <!-- Background Track (Clipped) -->
    <div class="absolute inset-0 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 ring-1 ring-slate-900/5 dark:ring-white/10 pointer-events-none">
        <!-- Ticks -->
        <div class="absolute inset-0 flex justify-between px-2">
            {#each ticks as tick}
                {#if tick % 2 === 0}
                    <div class="h-full flex flex-col justify-end pb-1 items-center w-0">
                        <div class="h-2 w-px bg-slate-400 dark:bg-slate-500"></div>
                        <span class="text-[10px] text-slate-500 dark:text-slate-400 font-mono select-none">{tick}</span>
                    </div>
                {:else}
                    <div class="h-full flex flex-col justify-end pb-2 items-center w-0">
                        <div class="h-1 w-px bg-slate-300 dark:bg-slate-600"></div>
                    </div>
                {/if}
            {/each}
        </div>

        <!-- Day/Night Gradient Overlay -->
        <div class="absolute inset-0 opacity-10 pointer-events-none bg-gradient-to-r from-indigo-900 via-yellow-200 to-indigo-900"></div>
    </div>

    <!-- Handle -->
    <div
        class="absolute top-0 bottom-0 w-0.5 sm:w-1 bg-red-500 z-10 shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-transform duration-75 ease-out"
        style="left: {getHandlePosition()}%; transform: translateX(-50%);"
    >
        <!-- Time Label (Floating above) -->
        <div class="absolute -top-9 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div class="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg font-mono whitespace-nowrap">
                {format(value, 'HH:mm')}
            </div>
            <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-red-600"></div>
        </div>

        <!-- Bottom Knob -->
        <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-red-500 rounded-full shadow-sm"></div>
    </div>
</div>
