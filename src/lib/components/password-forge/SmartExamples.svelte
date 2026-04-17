<script lang="ts">
  import { Zap } from 'lucide-svelte';
  import type { PasswordConfig, PassphraseConfig } from '$lib/utils/password-forge/generator';

  export let dictionary: Record<string, any>;
  export let onApplyPassword: (config: PasswordConfig) => void;
  export let onApplyPassphrase: (config: PassphraseConfig) => void;

  const presets = [
    {
      id: 'pin',
      label: dictionary.presets.pin,
      mode: 'password',
      config: { length: 6, uppercase: false, lowercase: false, numbers: true, symbols: false, excludeSimilar: false, excludeAmbiguous: false } as PasswordConfig
    },
    {
      id: 'wifi',
      label: dictionary.presets.wifi,
      mode: 'password',
      config: { length: 16, uppercase: true, lowercase: true, numbers: true, symbols: false, excludeSimilar: true, excludeAmbiguous: false } as PasswordConfig
    },
    {
      id: 'apple',
      label: dictionary.presets.apple,
      mode: 'password',
      config: { length: 15, uppercase: true, lowercase: true, numbers: true, symbols: false, excludeSimilar: false, excludeAmbiguous: false } as PasswordConfig
    },
    {
      id: 'crypto',
      label: dictionary.presets.crypto,
      mode: 'passphrase',
      config: { words: 12, separator: ' ', capitalize: 'none', includeNumber: false } as PassphraseConfig
    }
  ];

</script>

<div class="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
  <div class="flex items-center gap-2 mb-4">
    <Zap size={20} class="text-amber-500" />
    <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100">{dictionary.presets.title}</h3>
  </div>

  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
    {#each presets as preset}
      <button
        class="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-indigo-50 hover:border-indigo-200 dark:hover:bg-indigo-900/30 dark:hover:border-indigo-800 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300 text-left flex flex-col justify-center min-h-[44px] min-w-[44px]"
        on:click={() => {
          if (preset.mode === 'password') {
            onApplyPassword(preset.config as PasswordConfig);
          } else {
            onApplyPassphrase(preset.config as PassphraseConfig);
          }
        }}
      >
        {preset.label}
      </button>
    {/each}
  </div>
</div>
