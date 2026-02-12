<script lang="ts">
  import { onMount } from 'svelte';
  export let name = 'Video Player';

  let isPlaying = false;
  let progress = 30;
  let volume = 80;
  let duration = 324; // 5:24

  function togglePlay() {
      isPlaying = !isPlaying;
  }

  function formatTime(s: number) {
      const min = Math.floor(s / 60);
      const sec = s % 60;
      return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  let interval: ReturnType<typeof setInterval>;

  $: if (isPlaying) {
      interval = setInterval(() => {
          if (progress < 100) progress += 0.5;
          else isPlaying = false;
      }, 100);
  } else {
      clearInterval(interval);
  }

  onMount(() => {
      return () => clearInterval(interval);
  });
</script>

<div class="h-full w-full bg-black rounded-lg overflow-hidden relative group shadow-lg flex flex-col justify-center items-center select-none text-white">
  <!-- Poster / Background -->
  <div class="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-black/80 z-0"></div>
  <div
     class="absolute inset-0 z-0 opacity-20 bg-center bg-cover transition-transform duration-[10s] ease-linear"
     class:scale-110={isPlaying}
     style="background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBvbHlnb24gcG9pbnRzPSI1IDMgMTkgMTIgNSAyMSA1IDMiLz48L3N2Zz4=');"
  ></div>

  <!-- Big Play Button -->
  {#if !isPlaying}
      <button
         class="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center pl-1 hover:scale-110 hover:bg-white/20 transition-all z-10 shadow-2xl"
         on:click={togglePlay}
         aria-label="Play Video"
      >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      </button>
  {/if}

  <!-- Controls Overlay -->
  <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col gap-2 transition-opacity opacity-0 group-hover:opacity-100 z-20">
      <!-- Scrubber -->
      <div class="w-full h-1 bg-white/20 rounded-full cursor-pointer relative group/scrubber">
          <div class="absolute top-0 bottom-0 left-0 bg-red-600 rounded-full" style="width: {progress}%"></div>
          <div class="absolute w-3 h-3 bg-white rounded-full -mt-1 shadow opacity-0 group-hover/scrubber:opacity-100 transition-opacity" style="left: {progress}%"></div>
      </div>

      <div class="flex justify-between items-center text-xs font-mono">
          <div class="flex items-center gap-3">
              <button on:click={togglePlay} class="hover:text-indigo-400 transition-colors">
                  {#if isPlaying}
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  {:else}
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  {/if}
              </button>
              <span>{formatTime(Math.floor(duration * (progress / 100)))} / {formatTime(duration)}</span>
          </div>

          <div class="flex items-center gap-3">
              <div class="flex items-center gap-1 group/vol">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                  <div class="w-16 h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer">
                      <div class="h-full bg-white" style="width: {volume}%"></div>
                  </div>
              </div>
              <button aria-label="Fullscreen">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
              </button>
          </div>
      </div>
  </div>

  <div class="absolute top-4 right-4 bg-black/40 backdrop-blur px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border border-white/10">
      4K HDR
  </div>
</div>
