<script lang="ts">
    import type { Permission } from '$lib/utils/perms-forge/permissions';

    export let permission: Permission;

    let path = 'filename.ext';
    let recursive = false;
    let type: 'file' | 'dir' = 'file';

    $: command = permission.generateCommand(path, recursive);

    function copy() {
        navigator.clipboard.writeText(command);
    }
</script>

<div class="bg-slate-900 text-slate-300 rounded-2xl shadow-xl overflow-hidden">
    <!-- Toolbar -->
    <div class="flex items-center gap-4 px-4 py-3 bg-slate-950 border-b border-slate-800">
        <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-red-500"></div>
            <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div class="flex-1"></div>
        <div class="text-xs font-mono text-slate-500">bash</div>
    </div>

    <!-- Configuration -->
    <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-800/50">
        <div class="flex items-center gap-4">
            <input
                type="text"
                bind:value={path}
                class="bg-slate-800 border-none rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 w-full"
                placeholder="Path..."
            />
        </div>
        <div class="flex items-center gap-6">
            <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" bind:checked={recursive} class="rounded bg-slate-700 border-slate-600 text-indigo-500 focus:ring-indigo-500">
                <span class="text-sm">Recursive (-R)</span>
            </label>
        </div>
    </div>

    <!-- Terminal -->
    <div class="p-6 font-mono text-lg relative group">
        <span class="text-green-400 mr-2">$</span>
        <span class="text-white">{command}</span>

        <button
            on:click={copy}
            class="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Copy
        </button>
    </div>
</div>
