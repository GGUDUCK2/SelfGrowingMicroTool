<script lang="ts">
    import { Plus, X } from '@lucide/svelte';
    import type { ProjectConfig, StackId } from '$lib/utils/deploy-forge/types';
    import { STACKS } from '$lib/utils/deploy-forge/defaults';

    export let config: ProjectConfig;
    export let stackId: StackId;

    $: currentStack = STACKS.find(s => s.id === stackId);

    function addEnv() {
        config.envVars = [...config.envVars, { id: crypto.randomUUID(), key: '', value: '', isSecret: false }];
    }

    function removeEnv(id: string) {
        config.envVars = config.envVars.filter(e => e.id !== id);
    }
</script>

<div class="space-y-6">
    <!-- General Settings -->
    <div class="space-y-4">
        <h3 class="text-sm font-semibold text-slate-300 uppercase tracking-wider">Configuration</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-slate-400 mb-1" for="port">Port</label>
                <input
                    type="number"
                    id="port"
                    bind:value={config.port}
                    class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
                />
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-400 mb-1" for="baseImage">Base Image</label>
                <input
                    type="text"
                    id="baseImage"
                    bind:value={config.baseImage}
                    class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
                />
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-slate-400 mb-1" for="buildCmd">Build Command</label>
                <input
                    type="text"
                    id="buildCmd"
                    bind:value={config.buildCmd}
                    placeholder={currentStack?.buildCmdPlaceholder}
                    class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
                />
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-400 mb-1" for="startCmd">Start Command</label>
                <input
                    type="text"
                    id="startCmd"
                    bind:value={config.startCmd}
                    placeholder={currentStack?.startCmdPlaceholder}
                    class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
                />
            </div>
        </div>
    </div>

    <!-- Environment Variables -->
    <div class="space-y-3">
         <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-slate-300 uppercase tracking-wider">Environment Variables</h3>
            <button on:click={addEnv} class="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 min-h-[44px] min-w-[44px] px-2">
                <Plus size={14} /> Add Variable
            </button>
        </div>

        {#if config.envVars.length === 0}
            <div class="text-sm text-slate-500 italic">No environment variables defined.</div>
        {/if}

        <div class="space-y-3">
            {#each config.envVars as env (env.id)}
                <div class="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                    <div class="flex items-center gap-2 mb-2">
                        <input
                            type="text"
                            placeholder="KEY"
                            bind:value={env.key}
                            class="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
                        />
                        <input
                            type="text"
                            placeholder="VALUE"
                            bind:value={env.value}
                            class="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
                        />
                        <button
                            class="p-2 text-slate-500 hover:text-red-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
                            on:click={() => removeEnv(env.id)}
                            aria-label="Remove environment variable"
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <label class="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none min-h-[44px] min-w-[44px]">
                        <input type="checkbox" bind:checked={env.isSecret} class="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-indigo-500 min-w-[20px] min-h-[20px]" />
                        Treat as Secret (exclude from Dockerfile, use .env)
                    </label>
                </div>
            {/each}
        </div>
    </div>
</div>
