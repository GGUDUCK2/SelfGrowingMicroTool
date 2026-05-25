<script lang="ts">
  import { animationStore, selectedKeyframeId } from '$lib/utils/motion-master/store';
  import { Plus, X } from '@lucide/svelte';

  let track: HTMLElement;
  let isDragging = false;
  let dragId: string | null = null;

  function handleTrackClick(e: MouseEvent) {
    if (isDragging) return;
    const rect = track.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.round((x / rect.width) * 100);

    // Add keyframe
    const newId = crypto.randomUUID();
    $animationStore.keyframes = [
        ...$animationStore.keyframes,
        { id: newId, percentage: Math.max(0, Math.min(100, percentage)), properties: [] }
    ];
    $selectedKeyframeId = newId;
  }

  function handleMouseDown(id: string, e: MouseEvent) {
      e.stopPropagation();
      isDragging = true;
      dragId = id;
      $selectedKeyframeId = id;
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
  }

  function handleMouseMove(e: MouseEvent) {
      if (!isDragging || !dragId) return;
      const rect = track.getBoundingClientRect();
      let x = e.clientX - rect.left;
      let percentage = Math.round((x / rect.width) * 100);
      percentage = Math.max(0, Math.min(100, percentage));

      // Snap to 10% if Shift is held
      if (e.shiftKey) {
          percentage = Math.round(percentage / 10) * 10;
      }

      $animationStore.keyframes = $animationStore.keyframes.map(k => {
          if (k.id === dragId) return { ...k, percentage };
          return k;
      });
  }

  function handleMouseUp() {
      isDragging = false;
      dragId = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
  }

  // Touch Support
  function handleTouchStart(id: string, e: TouchEvent) {
      e.stopPropagation();
      isDragging = true;
      dragId = id;
      $selectedKeyframeId = id;
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
  }

  function handleTouchMove(e: TouchEvent) {
      if (!isDragging || !dragId) return;
      const touch = e.touches[0];
      const rect = track.getBoundingClientRect();
      let x = touch.clientX - rect.left;
      let percentage = Math.round((x / rect.width) * 100);
      percentage = Math.max(0, Math.min(100, percentage));

      $animationStore.keyframes = $animationStore.keyframes.map(k => {
          if (k.id === dragId) return { ...k, percentage };
          return k;
      });
  }

  function handleTouchEnd() {
      isDragging = false;
      dragId = null;
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
  }
</script>

<div class="relative w-full h-24 bg-slate-100 dark:bg-slate-800 rounded-lg p-4 select-none border border-slate-200 dark:border-slate-700">
   <!-- Rulers / Grid lines -->
   <div class="absolute top-0 left-4 right-4 h-full flex justify-between text-xs text-slate-400 pointer-events-none select-none">
       <span>0%</span>
       <span>25%</span>
       <span>50%</span>
       <span>75%</span>
       <span>100%</span>
   </div>

   <div class="absolute top-8 left-4 right-4 h-px bg-slate-200 dark:bg-slate-700 pointer-events-none"></div>

   <!-- Track -->
   <!-- svelte-ignore a11y-click-events-have-key-events -->
   <!-- svelte-ignore a11y-no-static-element-interactions -->
   <div
     bind:this={track}
     class="absolute top-1/2 left-4 right-4 h-2 bg-slate-300 dark:bg-slate-600 rounded-full cursor-pointer hover:bg-slate-400 dark:hover:bg-slate-500 transition-colors"
     on:click={handleTrackClick}
   >
      <!-- Keyframes -->
      {#each $animationStore.keyframes as keyframe (keyframe.id)}
         <!-- svelte-ignore a11y-no-static-element-interactions -->
         <div
            class="absolute top-1/2 -mt-3 -ml-3 w-6 h-6 rounded-full border-2 cursor-grab active:cursor-grabbing shadow-sm flex items-center justify-center transition-transform hover:scale-110
            {$selectedKeyframeId === keyframe.id ? 'bg-indigo-500 border-white z-20 scale-110 ring-2 ring-indigo-300' : 'bg-white border-indigo-500 z-10'}"
            style="left: {keyframe.percentage}%"
            on:mousedown={(e) => handleMouseDown(keyframe.id, e)}
            on:touchstart={(e) => handleTouchStart(keyframe.id, e)}
            role="slider"
            aria-valuenow={keyframe.percentage}
            aria-valuemin="0"
            aria-valuemax="100"
            tabindex="0"
            aria-label="Keyframe at {keyframe.percentage}%"
         >
             {#if $selectedKeyframeId === keyframe.id}
               <div class="absolute -bottom-8 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-100 transition-opacity whitespace-nowrap font-mono shadow-lg">
                   {keyframe.percentage}%
               </div>
             {/if}
         </div>
      {/each}
   </div>

   <div class="absolute bottom-2 right-2 text-[10px] text-slate-400">
     Shift + Drag to snap
   </div>
</div>
