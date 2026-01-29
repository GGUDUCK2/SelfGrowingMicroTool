<script lang="ts">
    import { animationStore, selectedKeyframeId } from '$lib/utils/motion-master/store';
    import { Trash2, Plus, Play, Pause, RotateCcw, X } from 'lucide-svelte';

    // Dictionary prop will be passed from page
    export let dict: any;

    let newPropName = 'opacity';

    const commonProps = [
        'opacity', 'transform', 'background-color', 'width', 'height', 'border-radius', 'filter', 'box-shadow', 'color'
    ];

    $: selectedKeyframe = $animationStore.keyframes.find(k => k.id === $selectedKeyframeId);

    function addProperty() {
        if (!selectedKeyframe) return;

        let initialValue = '1';
        if (newPropName.includes('color')) initialValue = '#ef4444';
        if (newPropName === 'transform') initialValue = 'scale(1.2)';
        if (newPropName === 'filter') initialValue = 'blur(5px)';
        if (newPropName === 'width') initialValue = '100px';
        if (newPropName === 'height') initialValue = '100px';
        if (newPropName === 'border-radius') initialValue = '50%';
        if (newPropName === 'box-shadow') initialValue = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';

        $animationStore.keyframes = $animationStore.keyframes.map(k => {
            if (k.id === $selectedKeyframeId) {
                return { ...k, properties: [...k.properties, { name: newPropName, value: initialValue }] };
            }
            return k;
        });
    }

    function updateProp(propIndex: number, value: string) {
         if (!selectedKeyframe) return;
          $animationStore.keyframes = $animationStore.keyframes.map(k => {
            if (k.id === $selectedKeyframeId) {
                const newProps = [...k.properties];
                newProps[propIndex] = { ...newProps[propIndex], value };
                return { ...k, properties: newProps };
            }
            return k;
        });
    }

    function removeProp(propIndex: number) {
        if (!selectedKeyframe) return;
         $animationStore.keyframes = $animationStore.keyframes.map(k => {
            if (k.id === $selectedKeyframeId) {
                const newProps = k.properties.filter((_, i) => i !== propIndex);
                return { ...k, properties: newProps };
            }
            return k;
        });
    }

    function deleteKeyframe() {
        if (!$selectedKeyframeId) return;
        $animationStore.keyframes = $animationStore.keyframes.filter(k => k.id !== $selectedKeyframeId);
        $selectedKeyframeId = null;
    }
</script>

<div class="space-y-6">
    <!-- Global Settings -->
    {#if !$selectedKeyframeId}
        <div class="animate-fade-in">
            <h3 class="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <div class="w-1 h-4 bg-indigo-500 rounded-full"></div>
                {dict?.title?.split(':')[0] ?? 'Motion Master'}
            </h3>
            <div class="space-y-4">
                <div>
                    <label for="duration-slider" class="block text-xs font-semibold text-slate-500 uppercase mb-1">{dict?.duration ?? 'Duration'}</label>
                    <div class="flex items-center gap-2">
                         <input id="duration-slider" type="range" min="100" max="5000" step="100" bind:value={$animationStore.duration} class="flex-1 accent-indigo-500" />
                         <label for="duration-input" class="sr-only">Duration Value</label>
                         <input
                            id="duration-input"
                            type="number"
                            bind:value={$animationStore.duration}
                            class="w-16 bg-slate-100 dark:bg-slate-700 border-none rounded p-1 text-sm font-mono text-center"
                         />
                    </div>
                </div>

                 <div>
                    <label for="iterations-select" class="block text-xs font-semibold text-slate-500 uppercase mb-1">{dict?.iterations ?? 'Iterations'}</label>
                    <select id="iterations-select" bind:value={$animationStore.iterations} class="w-full bg-slate-100 dark:bg-slate-700 border-none rounded p-2 text-sm text-slate-800 dark:text-slate-200">
                        <option value="infinite">{dict?.infinite ?? 'Infinite'}</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="5">5</option>
                        <option value="10">10</option>
                    </select>
                </div>

                 <div>
                    <label for="easing-select" class="block text-xs font-semibold text-slate-500 uppercase mb-1">{dict?.easing ?? 'Easing'}</label>
                     <select id="easing-select" bind:value={$animationStore.timingFunction} class="w-full bg-slate-100 dark:bg-slate-700 border-none rounded p-2 text-sm text-slate-800 dark:text-slate-200">
                        <option value="linear">linear</option>
                        <option value="ease">ease</option>
                        <option value="ease-in">ease-in</option>
                        <option value="ease-out">ease-out</option>
                        <option value="ease-in-out">ease-in-out</option>
                        <option value="cubic-bezier(0.4, 0, 0.2, 1)">Material FastOutSlowIn</option>
                        <option value="cubic-bezier(0.68, -0.55, 0.27, 1.55)">Back Out</option>
                        <option value="cubic-bezier(0.175, 0.885, 0.32, 1.275)">Back InOut</option>
                    </select>
                </div>

                <div>
                    <label for="anim-name" class="block text-xs font-semibold text-slate-500 uppercase mb-1">Animation Name</label>
                    <input
                        id="anim-name"
                        type="text"
                        bind:value={$animationStore.name}
                        class="w-full bg-slate-100 dark:bg-slate-700 border-none rounded p-2 text-sm font-mono"
                    />
                </div>
            </div>
        </div>
    {:else}
    <!-- Keyframe Properties -->
        <div class="animate-slide-up">
             <div class="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-mono">{selectedKeyframe.percentage}%</span>
                    Keyframe
                </h3>
                <button on:click={() => $selectedKeyframeId = null} class="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200" aria-label="Close Properties">
                    <X class="w-4 h-4" />
                </button>
             </div>

             <div class="space-y-3 mb-6">
                 {#if selectedKeyframe.properties.length === 0}
                    <div class="text-center py-4 text-slate-400 text-sm italic">
                        No properties added yet.
                    </div>
                 {/if}

                 {#each selectedKeyframe.properties as prop, i}
                    <div class="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg flex flex-col gap-2 group border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
                        <div class="flex items-center justify-between">
                            <label for="prop-{i}" class="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">{prop.name}</label>
                            <button on:click={() => removeProp(i)} class="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all" aria-label="Remove property"><Trash2 class="w-3.5 h-3.5" /></button>
                        </div>
                        <input
                            id="prop-{i}"
                            type="text"
                            value={prop.value}
                            on:input={(e) => updateProp(i, e.currentTarget.value)}
                            class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-2 py-1.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                 {/each}
             </div>

             <div class="pt-2 space-y-3">
                 <div>
                     <label for="new-prop-select" class="block text-xs font-semibold text-slate-500 uppercase mb-2">{dict?.addProperty ?? 'Add Property'}</label>
                     <div class="flex gap-2">
                         <select id="new-prop-select" bind:value={newPropName} class="flex-1 bg-slate-100 dark:bg-slate-700 border-none rounded-lg p-2 text-sm text-slate-800 dark:text-slate-200">
                             {#each commonProps as p}
                                 <option value={p}>{p}</option>
                             {/each}
                         </select>
                         <button on:click={addProperty} class="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors shadow-sm" aria-label="Add Property">
                             <Plus class="w-5 h-5" />
                         </button>
                     </div>
                 </div>

                 <button
                    on:click={deleteKeyframe}
                    class="w-full py-2 text-red-500 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors mt-6"
                 >
                    {dict?.delete ?? 'Delete Keyframe'}
                 </button>
             </div>
        </div>
    {/if}
</div>
