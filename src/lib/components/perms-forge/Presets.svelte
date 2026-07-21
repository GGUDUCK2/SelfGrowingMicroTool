<script lang="ts">
    import type { Permission } from '$lib/utils/perms-forge/permissions';
    import { createEventDispatcher } from 'svelte';

    export let permission: Permission;
    export let onUpdate: () => void;

    const presets = [
        { label: 'Public Read', value: 0o644, desc: 'Files (rw-r--r--)' },
        { label: 'Public Exec', value: 0o755, desc: 'Dirs/Scripts (rwxr-xr-x)' },
        { label: 'Private', value: 0o600, desc: 'Keys/Secrets (rw-------)' },
        { label: 'Private Dir', value: 0o700, desc: 'Private Folder (rwx------)' },
        { label: 'Full Access', value: 0o777, desc: 'Dangerous! (rwxrwxrwx)' },
        { label: 'Group Write', value: 0o664, desc: 'Team Data (rw-rw-r--)' },
        { label: 'Sticky Tmp', value: 0o1777, desc: '/tmp dir (rwxrwxrwt)' }
    ];

    function apply(value: number) {
        permission.value = value;
        onUpdate();
    }
</script>

<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
    {#each presets as p}
        <button
            on:click={() => apply(p.value)}
            class="flex flex-col items-start p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all text-left group min-h-[44px] min-w-[44px]"
        >
            <div class="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{p.label}</div>
            <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">{p.desc}</div>
        </button>
    {/each}
</div>
