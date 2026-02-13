<script lang="ts">
  import { pages, selectedPages } from '$lib/utils/pdf-forge/store';
  import { reorderPages } from '$lib/utils/pdf-forge/engine';
  import PageThumbnail from './PageThumbnail.svelte';
  import { flip } from 'svelte/animate';
  import { fade } from 'svelte/transition';

  let draggingIndex: number | null = null;
  let dragOverIndex: number | null = null;

  function toggleSelection(id: string, multi: boolean) {
    selectedPages.update(s => {
      const newSet = new Set(s);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          // If not multi (shift key), maybe clear others?
          // Usually standard is click toggles, shift+click does range?
          // For now, simple toggle is fine.
          newSet.add(id);
      }
      return newSet;
    });
  }

  function handleDragStart(e: DragEvent, index: number) {
    draggingIndex = index;
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
        // Set drag image to a cleaner version if possible, but default is usually okay
    }
  }

  function handleDragEnter(index: number) {
      if (draggingIndex !== null && draggingIndex !== index) {
          dragOverIndex = index;
      }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault(); // allow drop
  }

  function handleDrop(e: DragEvent, targetIndex: number) {
    e.preventDefault();
    if (draggingIndex === null) return;

    reorderPages(draggingIndex, targetIndex);

    draggingIndex = null;
    dragOverIndex = null;
  }

  function handleDragEnd() {
      draggingIndex = null;
      dragOverIndex = null;
  }
</script>

<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 p-4 pb-20">
  {#each $pages as page, index (page.id)}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      animate:flip={{duration: 300}}
      transition:fade={{duration: 200}}
      draggable="true"
      on:dragstart={(e) => handleDragStart(e, index)}
      on:dragenter={() => handleDragEnter(index)}
      on:dragover={handleDragOver}
      on:drop={(e) => handleDrop(e, index)}
      on:dragend={handleDragEnd}
      class="relative rounded-xl transition-all duration-200
        {draggingIndex === index ? 'opacity-20 scale-90' : 'opacity-100'}
        {dragOverIndex === index ? 'scale-105 z-10' : ''}"
    >
      <!-- Drop Indicator Line -->
      {#if dragOverIndex === index && draggingIndex !== null}
         <div class="absolute inset-y-0 -left-3 w-1 bg-indigo-500 rounded-full z-20 pointer-events-none shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
      {/if}

      <PageThumbnail
        {page}
        {index}
        selected={$selectedPages.has(page.id)}
        on:click={(e) => toggleSelection(page.id, e.shiftKey)}
        on:keydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleSelection(page.id, false);
            }
        }}
      />
    </div>
  {/each}
</div>
