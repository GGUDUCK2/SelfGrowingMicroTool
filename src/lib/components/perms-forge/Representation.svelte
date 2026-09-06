<script lang="ts">
    import type { Permission } from '$lib/utils/perms-forge/permissions';
    import { fade } from 'svelte/transition';

    export let permission: Permission;
    export let onUpdate: () => void;

    let octalInput = '';
    let symbolicInput = '';

    // Update local inputs when permission changes externally
    $: {
        octalInput = permission.octal;
        symbolicInput = permission.symbolic;
    }

    function updateOctal() {
        permission.octal = octalInput;
        onUpdate();
    }

    function updateSymbolic() {
        permission.symbolic = symbolicInput;
        onUpdate();
    }

    function copy(text: string) {
        navigator.clipboard.writeText(text);
        // Toast handled by parent if needed, or simple visual feedback here
    }
</script>

<div class="grid md:grid-cols-3 gap-6">
    <!-- Octal -->
    <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative group">
        <label for="perms-octal" class="block text-sm font-medium text-slate-500 mb-2">Octal</label>
        <input
            id="perms-octal"
            type="text"
            bind:value={octalInput}
            on:input={updateOctal}
            class="w-full text-4xl font-mono font-bold bg-transparent text-slate-900 dark:text-white outline-none tracking-tight"
        />
        <button aria-label="Copy Octal" class="absolute top-4 right-4 p-2 text-slate-400 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity min-h-[44px] min-w-[44px]" on:click={() => copy(permission.octal)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        </button>
    </div>

    <!-- Symbolic -->
    <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative group md:col-span-2">
        <label for="perms-symbolic" class="block text-sm font-medium text-slate-500 mb-2">Symbolic</label>
        <input
            id="perms-symbolic"
            type="text"
            bind:value={symbolicInput}
            on:input={updateSymbolic}
            class="w-full text-4xl font-mono font-bold bg-transparent text-slate-900 dark:text-white outline-none tracking-widest"
        />
        <button aria-label="Copy Symbolic" class="absolute top-4 right-4 p-2 text-slate-400 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity min-h-[44px] min-w-[44px]" on:click={() => copy(permission.symbolic)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        </button>
    </div>
</div>

<!-- Binary & Decimal (Smaller) -->
<div class="grid grid-cols-2 gap-6 mt-6">
    <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div class="text-xs text-slate-500 uppercase tracking-wider mb-1">Binary</div>
        <div class="font-mono text-lg text-slate-700 dark:text-slate-300 break-all">{permission.binary}</div>
    </div>
    <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div class="text-xs text-slate-500 uppercase tracking-wider mb-1">Decimal</div>
        <div class="font-mono text-lg text-slate-700 dark:text-slate-300">{permission.value}</div>
    </div>
</div>
