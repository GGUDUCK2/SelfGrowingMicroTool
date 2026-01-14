<script lang="ts">
  import { fade } from 'svelte/transition';

  export let binary: string; // e.g. "11000000.10101000..." or "2001:..." (binary representation)
  export let maskLength: number;
  export let version: 4 | 6 = 4;

  // For IPv6, the binary string might be very long. We might want to truncate or just show it all (it's 128 bits, manageable).
  // The input `binary` from Calculator is already formatted with dots or colons.

  // We need a raw string to calculate indices relative to the mask.
  $: rawBinary = binary.replace(/[.:]/g, '');

  // We want to render the formatted string but color each character.
  // So we iterate over the formatted string and keep a separate counter for "bit index".

  function getBitState(char: string, rawIndex: number) {
      if (char === '.' || char === ':') return 'separator';
      return rawIndex < maskLength ? 'network' : 'host';
  }

  // Create a structured array for rendering
  $: chars = (() => {
      let bitIndex = 0;
      return binary.split('').map((char, i) => {
          const type = char === '.' || char === ':' ? 'separator' : (bitIndex < maskLength ? 'network' : 'host');
          if (type !== 'separator') bitIndex++;
          return { char, type, index: i };
      });
  })();

</script>

<div class="p-6 bg-slate-900 rounded-xl overflow-x-auto border border-slate-700 shadow-inner">
    <div class="flex flex-wrap gap-y-2 font-mono text-sm md:text-base leading-relaxed break-all max-w-full">
        {#each chars as { char, type }, i}
            <span
                class="inline-block transition-colors duration-300"
                class:text-indigo-400={type === 'network'}
                class:font-bold={type === 'network'}
                class:text-slate-500={type === 'host'}
                class:text-slate-700={type === 'separator'}
                class:mx-1={type === 'separator'}
            >
                {char}
            </span>
            <!-- Add a small break for IPv6 readability if needed, but flex-wrap handles it -->
        {/each}
    </div>

    <div class="mt-4 flex gap-6 text-xs text-slate-400">
        <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-indigo-400 rounded-full"></div>
            <span>Network Bits ({maskLength})</span>
        </div>
        <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-slate-500 rounded-full"></div>
            <span>Host Bits ({version === 4 ? 32 - maskLength : 128 - maskLength})</span>
        </div>
    </div>
</div>
