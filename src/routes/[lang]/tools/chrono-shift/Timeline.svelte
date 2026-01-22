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
    class="relative h-16 w-full bg-slate-200 dark:bg-slate-700 rounded-lg cursor-col-resize select-none overflow-hidden touch-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
    <!-- Ticks -->
    <div class="absolute inset-0 flex justify-between px-2">
        {#each ticks as tick}
            {#if tick % 2 === 0}
                <div class="h-full flex flex-col justify-end pb-1 items-center w-0">
                    <div class="h-2 w-px bg-slate-400"></div>
                    <span class="text-[10px] text-slate-500 font-mono select-none">{tick}</span>
                </div>
            {:else}
                 <div class="h-full flex flex-col justify-end pb-2 items-center w-0">
                    <div class="h-1 w-px bg-slate-300"></div>
                </div>
            {/if}
        {/each}
    </div>

    <!-- Day/Night Gradient Overlay (Simulated for generic day) -->
    <div class="absolute inset-0 opacity-10 pointer-events-none bg-gradient-to-r from-indigo-900 via-yellow-200 to-indigo-900"></div>

    <!-- Handle -->
    <div
        class="absolute top-0 bottom-0 w-1 bg-red-500 z-10 shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-transform duration-75 ease-out"
        style="left: {getHandlePosition()}%; transform: translateX(-50%);"
    >
        <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
            {format(value, 'HH:mm')}
        </div>
    </div>
</div>
