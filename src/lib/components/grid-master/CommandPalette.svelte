<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { gridStore, snapshotStore } from '$lib/utils/grid-master/store';
  import { downloadProjectZip, downloadPNG, copyReactComponent } from '$lib/utils/grid-master/export';
  import {
    Search, Plus, Trash2, RotateCcw,
    Smartphone, Monitor, Download, Moon,
    History, FileCode
  } from 'lucide-svelte';
  import type { GridMasterDictionary } from '$lib/utils/grid-master/types';

  export let dict: GridMasterDictionary;
  export let theme: string;

  const dispatch = createEventDispatcher();
  let query = '';
  let selectedIndex = 0;
  let inputEl: HTMLInputElement;

  type CommandItem = {
      id: string;
      label: string;
      group: string;
      icon: any;
      action: () => void;
      shortcut?: string;
  };

  $: commands = [
      // Edit
      { id: 'add-row', label: dict.add + ' ' + dict.rows, group: 'Edit', icon: Plus, action: () => gridStore.addRow() },
      { id: 'add-col', label: dict.add + ' ' + dict.cols, group: 'Edit', icon: Plus, action: () => gridStore.addCol() },
      { id: 'undo', label: dict.undo, group: 'Edit', icon: RotateCcw, action: () => gridStore.undo(), shortcut: 'Ctrl+Z' },
      { id: 'redo', label: dict.redo, group: 'Edit', icon: RotateCcw, action: () => gridStore.redo(), shortcut: 'Ctrl+Y' },
      { id: 'reset', label: dict.clear, group: 'System', icon: Trash2, action: () => dispatch('reset') },

      // View
      { id: 'desktop', label: dict.desktop + ' ' + dict.viewMode, group: 'View', icon: Monitor, action: () => dispatch('setView', 'desktop') },
      { id: 'mobile', label: dict.mobile + ' ' + dict.viewMode, group: 'View', icon: Smartphone, action: () => dispatch('setView', 'mobile') },
      { id: 'theme-standard', label: 'Theme: Standard', group: 'View', icon: Moon, action: () => dispatch('setTheme', 'standard') },
      { id: 'theme-cyber', label: 'Theme: Cyber', group: 'View', icon: Moon, action: () => dispatch('setTheme', 'cyber') },
      { id: 'theme-blueprint', label: 'Theme: Blueprint', group: 'View', icon: Moon, action: () => dispatch('setTheme', 'blueprint') },

      // Export
      { id: 'export-zip', label: dict.exportProject, group: 'Export', icon: Download, action: () => downloadProjectZip($gridStore) },
      { id: 'export-png', label: dict.downloadPng, group: 'Export', icon: Download, action: () => downloadPNG($gridStore, theme) },
      { id: 'copy-react', label: 'Copy React Component', group: 'Export', icon: FileCode, action: async () => {
          await copyReactComponent($gridStore);
          dispatch('toast', dict.copied);
      }},

      // History (Snapshots)
      ...($snapshotStore.map(snap => ({
          id: `snap-${snap.id}`,
          label: `Restore: ${snap.name}`,
          group: 'History',
          icon: History,
          action: () => {
              if (confirm(dict.restoreConfirm)) {
                  gridStore.load(snap.state);
              }
          }
      })))
  ] as CommandItem[];

  $: filteredCommands = commands.filter(c =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.group.toLowerCase().includes(query.toLowerCase())
  );

  function close() {
      dispatch('close');
  }

  function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
          close();
      } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          selectedIndex = (selectedIndex + 1) % filteredCommands.length;
      } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          selectedIndex = (selectedIndex - 1 + filteredCommands.length) % filteredCommands.length;
      } else if (e.key === 'Enter') {
          e.preventDefault();
          execute(filteredCommands[selectedIndex]);
      }
  }

  function execute(cmd: CommandItem) {
      if (!cmd) return;
      cmd.action();
      close();
  }

  onMount(() => {
      inputEl?.focus();
  });
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div
    class="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4 bg-black/50 backdrop-blur-sm"
    transition:fade={{ duration: 100 }}
    on:click={close}
    on:keydown={(e) => e.key === 'Escape' && close()}
    role="presentation"
>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
      class="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col outline-none"
      transition:scale={{ duration: 150, start: 0.98 }}
      on:click|stopPropagation
      role="dialog"
      aria-modal="true"
      tabindex="-1"
  >
      <div class="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800 gap-3">
          <Search class="text-slate-400" size={20} />
          <input
              bind:this={inputEl}
              bind:value={query}
              class="flex-1 bg-transparent border-none outline-none text-lg text-slate-800 dark:text-slate-200 placeholder-slate-400"
              placeholder={dict.commandPalette?.placeholder || "Type a command..."}
              spellcheck="false"
              autocomplete="off"
          />
          <kbd class="hidden sm:inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-500 font-mono">ESC</kbd>
      </div>

      <div class="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
          {#if filteredCommands.length === 0}
              <div class="p-4 text-center text-slate-500 text-sm">{dict.commandPalette?.noCommands || "No commands found."}</div>
          {:else}
              {#each filteredCommands as cmd, i (cmd.id)}
                  <button
                      class="w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors
                      {i === selectedIndex ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}"
                      on:click={() => execute(cmd)}
                      on:mouseenter={() => selectedIndex = i}
                  >
                      <svelte:component this={cmd.icon} size={18} class={i === selectedIndex ? 'text-white' : 'text-slate-400'} />
                      <div class="flex-1 truncate">
                          <span class="font-medium">{cmd.label}</span>
                          {#if cmd.group}
                              <span class="ml-2 text-xs opacity-50 border border-current px-1 rounded">{cmd.group}</span>
                          {/if}
                      </div>
                      {#if cmd.shortcut}
                          <span class="text-xs opacity-60 font-mono">{cmd.shortcut}</span>
                      {/if}
                  </button>
              {/each}
          {/if}
      </div>
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
  }
  :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #334155;
  }
</style>
