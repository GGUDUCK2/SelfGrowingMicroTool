<script lang="ts">
    import type { Permission } from '$lib/utils/perms-forge/permissions';
    import { slide } from 'svelte/transition';

    export let permission: Permission;
    export let onUpdate: () => void;

    // Helper to toggle and update
    function toggle(bit: 'userRead' | 'userWrite' | 'userExec' | 'groupRead' | 'groupWrite' | 'groupExec' | 'otherRead' | 'otherWrite' | 'otherExec' | 'suid' | 'sgid' | 'sticky') {
        permission[bit] = !permission[bit];
        onUpdate();
    }
</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 overflow-hidden">
    <!-- Main Grid -->
    <div class="grid grid-cols-4 gap-4 text-center">
        <!-- Headers -->
        <div class="font-bold text-slate-400 text-sm uppercase tracking-wider self-end pb-2">Scope</div>
        <div class="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider bg-slate-100 dark:bg-slate-700/50 py-2 rounded-lg">Read (4)</div>
        <div class="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider bg-slate-100 dark:bg-slate-700/50 py-2 rounded-lg">Write (2)</div>
        <div class="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider bg-slate-100 dark:bg-slate-700/50 py-2 rounded-lg">Execute (1)</div>

        <!-- User Row -->
        <div class="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 text-left pl-2">
            <span class="w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </span>
            User
        </div>
        <button class="grid-btn {permission.userRead ? 'active' : ''}" on:click={() => toggle('userRead')} aria-label="User Read">
            <span class="code">r</span>
        </button>
        <button class="grid-btn {permission.userWrite ? 'active' : ''}" on:click={() => toggle('userWrite')} aria-label="User Write">
            <span class="code">w</span>
        </button>
        <button class="grid-btn {permission.userExec ? 'active' : ''}" on:click={() => toggle('userExec')} aria-label="User Execute">
            <span class="code">x</span>
        </button>

        <!-- Group Row -->
        <div class="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 text-left pl-2">
            <span class="w-8 h-8 flex items-center justify-center bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </span>
            Group
        </div>
        <button class="grid-btn {permission.groupRead ? 'active' : ''}" on:click={() => toggle('groupRead')} aria-label="Group Read">
            <span class="code">r</span>
        </button>
        <button class="grid-btn {permission.groupWrite ? 'active' : ''}" on:click={() => toggle('groupWrite')} aria-label="Group Write">
            <span class="code">w</span>
        </button>
        <button class="grid-btn {permission.groupExec ? 'active' : ''}" on:click={() => toggle('groupExec')} aria-label="Group Execute">
            <span class="code">x</span>
        </button>

        <!-- Other Row -->
        <div class="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 text-left pl-2">
            <span class="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            </span>
            Other
        </div>
        <button class="grid-btn {permission.otherRead ? 'active' : ''}" on:click={() => toggle('otherRead')} aria-label="Other Read">
            <span class="code">r</span>
        </button>
        <button class="grid-btn {permission.otherWrite ? 'active' : ''}" on:click={() => toggle('otherWrite')} aria-label="Other Write">
            <span class="code">w</span>
        </button>
        <button class="grid-btn {permission.otherExec ? 'active' : ''}" on:click={() => toggle('otherExec')} aria-label="Other Execute">
            <span class="code">x</span>
        </button>
    </div>

    <!-- Special Bits -->
    <div class="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 grid grid-cols-3 gap-4">
        <label class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group">
            <div class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" checked={permission.suid} on:change={() => toggle('suid')}>
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </div>
            <div>
                <div class="text-sm font-semibold text-slate-700 dark:text-slate-300">SetUID</div>
                <div class="text-xs text-slate-500">Run as owner</div>
            </div>
        </label>

        <label class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group">
            <div class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" checked={permission.sgid} on:change={() => toggle('sgid')}>
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </div>
            <div>
                <div class="text-sm font-semibold text-slate-700 dark:text-slate-300">SetGID</div>
                <div class="text-xs text-slate-500">Inherit group</div>
            </div>
        </label>

        <label class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group">
            <div class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" checked={permission.sticky} on:change={() => toggle('sticky')}>
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </div>
            <div>
                <div class="text-sm font-semibold text-slate-700 dark:text-slate-300">Sticky</div>
                <div class="text-xs text-slate-500">Restricted deletion</div>
            </div>
        </label>
    </div>
</div>

<style lang="postcss">
    .grid-btn {
        @apply min-h-[44px] min-w-[44px];
        @apply h-14 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-400 bg-slate-50 dark:bg-slate-800 transition-all duration-200 flex items-center justify-center hover:border-slate-300 dark:hover:border-slate-600;
    }
    .grid-btn.active {
        @apply border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-500 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-500;
    }
    .code {
        @apply font-mono text-xl font-bold;
    }
</style>
