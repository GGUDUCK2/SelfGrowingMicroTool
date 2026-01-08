<script lang="ts">
  import { fade } from 'svelte/transition';

  export let id: string;
  export let type: string; // 'UUID-v7', 'UUID-v1', 'ULID', etc.

  // Helper to chunk string
  function chunk(str: string, ...lengths: number[]) {
      let current = 0;
      const parts = [];
      for (const len of lengths) {
          if (current >= str.length) break;
          parts.push(str.substr(current, len));
          current += len;
      }
      if (current < str.length) parts.push(str.substr(current));
      return parts;
  }

  let anatomy: { label: string; value: string; color: string; desc: string }[] = [];

  $: {
      const clean = id.replace(/-/g, '');
      anatomy = [];

      if (type === 'UUID' && id.length === 36) {
          // Check version
          const version = id.charAt(14);
          if (version === '7') {
             // v7: 8-4-4-4-12
             // unix_ts_ms (48 bits) - ver (4) - rand_a (12) - var (2) - rand_b (62)
             // Hex chars: 12 chars timestamp, 1 char ver, 3 chars rand, 1 char var, 15 chars rand
             // 00000000-0000-7000-0000-000000000000
             // Clean: 32 chars
             // 0-11 (12): Timestamp
             // 12 (1): Version
             // 13-15 (3): Rand A
             // 16 (1): Variant
             // 17-31 (15): Rand B
             anatomy = [
                 { label: 'Timestamp (48 bit)', value: clean.substr(0, 12), color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', desc: 'Unix Timestamp in ms' },
                 { label: 'Ver', value: clean.substr(12, 1), color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', desc: 'Version 7' },
                 { label: 'Rand A', value: clean.substr(13, 3), color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300', desc: 'Random Bits' },
                 { label: 'Var', value: clean.substr(16, 1), color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', desc: 'Variant' },
                 { label: 'Rand B', value: clean.substr(17), color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300', desc: 'Random Bits' }
             ];
          } else if (version === '4') {
             // v4: Random
             anatomy = [
                 { label: 'Random A', value: clean.substr(0, 12), color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300', desc: 'Random Bits' },
                 { label: 'Ver', value: clean.substr(12, 1), color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', desc: 'Version 4' },
                 { label: 'Random B', value: clean.substr(13, 3), color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300', desc: 'Random Bits' },
                 { label: 'Var', value: clean.substr(16, 1), color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', desc: 'Variant' },
                 { label: 'Random C', value: clean.substr(17), color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300', desc: 'Random Bits' }
             ];
          }
      } else if (type === 'ULID') {
          // ULID: 10 chars timestamp, 16 chars randomness
          anatomy = [
              { label: 'Timestamp (48 bit)', value: clean.substr(0, 10), color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', desc: 'Unix Timestamp in ms (Base32)' },
              { label: 'Randomness (80 bit)', value: clean.substr(10), color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300', desc: 'Cryptographically Secure Randomness' }
          ];
      }
  }
</script>

{#if anatomy.length > 0}
  <div transition:fade class="mt-6">
      <div class="flex flex-wrap gap-2 font-mono text-sm md:text-base">
          {#each anatomy as part}
              <div class="flex flex-col group relative">
                  <span class="{part.color} px-2 py-1 rounded border border-black/5 dark:border-white/5 text-center transition-transform hover:scale-105 cursor-help">
                      {part.value}
                  </span>
                  <!-- Tooltip -->
                  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] p-2 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-center">
                      <div class="font-bold">{part.label}</div>
                      <div class="text-slate-300">{part.desc}</div>
                  </div>
              </div>
          {/each}
      </div>
  </div>
{/if}
