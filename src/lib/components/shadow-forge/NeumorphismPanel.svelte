<script lang="ts">
  import { shadowStore } from '$lib/utils/shadow-forge/store';
  export let dict: any;
</script>

<div class="space-y-6">
    <div class="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 text-sm rounded-lg">
        {dict.neumorphism.info}
    </div>

    <div class="space-y-1">
        <div class="flex justify-between">
            <label for="neumorphismDistance" class="text-sm font-medium text-slate-700 dark:text-slate-300">{dict.neumorphism.distance}</label>
            <span class="text-sm text-slate-500">{$shadowStore.neumorphismConfig.distance}px</span>
        </div>
        <input id="neumorphismDistance" type="range" min="5" max="50" bind:value={$shadowStore.neumorphismConfig.distance} class="w-full accent-indigo-600 min-h-[44px]" />
    </div>

    <div class="space-y-1">
        <div class="flex justify-between">
            <label for="neumorphismIntensity" class="text-sm font-medium text-slate-700 dark:text-slate-300">{dict.neumorphism.intensity}</label>
            <span class="text-sm text-slate-500">{Math.round($shadowStore.neumorphismConfig.intensity * 100)}%</span>
        </div>
        <input id="neumorphismIntensity" type="range" min="0.05" max="0.5" step="0.01" bind:value={$shadowStore.neumorphismConfig.intensity} class="w-full accent-indigo-600 min-h-[44px]" />
    </div>

    <div class="space-y-1">
        <div class="flex justify-between">
            <label for="neumorphismBlur" class="text-sm font-medium text-slate-700 dark:text-slate-300">{dict.neumorphism.blur}</label>
            <span class="text-sm text-slate-500">{$shadowStore.neumorphismConfig.blur}px</span>
        </div>
        <input id="neumorphismBlur" type="range" min="0" max="100" bind:value={$shadowStore.neumorphismConfig.blur} class="w-full accent-indigo-600 min-h-[44px]" />
    </div>

    <div class="space-y-2">
        <span class="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.neumorphism.shape}</span>
        <div class="grid grid-cols-2 gap-2">
                <button class="py-2 px-3 text-sm font-medium rounded-lg border min-h-[44px] min-w-[44px] {$shadowStore.neumorphismConfig.shape === 'flat' ? 'bg-indigo-50 border-indigo-600 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}" on:click={() => $shadowStore.neumorphismConfig.shape = 'flat'}>{dict.neumorphism.shapes.flat}</button>
                <button class="py-2 px-3 text-sm font-medium rounded-lg border min-h-[44px] min-w-[44px] {$shadowStore.neumorphismConfig.shape === 'concave' ? 'bg-indigo-50 border-indigo-600 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}" on:click={() => $shadowStore.neumorphismConfig.shape = 'concave'}>{dict.neumorphism.shapes.concave}</button>
                <button class="py-2 px-3 text-sm font-medium rounded-lg border min-h-[44px] min-w-[44px] {$shadowStore.neumorphismConfig.shape === 'convex' ? 'bg-indigo-50 border-indigo-600 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}" on:click={() => $shadowStore.neumorphismConfig.shape = 'convex'}>{dict.neumorphism.shapes.convex}</button>
                <button class="py-2 px-3 text-sm font-medium rounded-lg border min-h-[44px] min-w-[44px] {$shadowStore.neumorphismConfig.shape === 'pressed' ? 'bg-indigo-50 border-indigo-600 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}" on:click={() => $shadowStore.neumorphismConfig.shape = 'pressed'}>{dict.neumorphism.shapes.pressed}</button>
        </div>
    </div>

    <div class="space-y-2">
        <span class="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.neumorphism.lightPosition}</span>
        <div class="grid grid-cols-2 gap-2">
            <button class="py-2 px-3 text-sm font-medium rounded-lg border min-h-[44px] min-w-[44px] {$shadowStore.neumorphismConfig.lightPosition === 'topLeft' ? 'bg-indigo-50 border-indigo-600 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}" on:click={() => $shadowStore.neumorphismConfig.lightPosition = 'topLeft'}>{dict.neumorphism.directions.topLeft}</button>
            <button class="py-2 px-3 text-sm font-medium rounded-lg border min-h-[44px] min-w-[44px] {$shadowStore.neumorphismConfig.lightPosition === 'topRight' ? 'bg-indigo-50 border-indigo-600 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}" on:click={() => $shadowStore.neumorphismConfig.lightPosition = 'topRight'}>{dict.neumorphism.directions.topRight}</button>
            <button class="py-2 px-3 text-sm font-medium rounded-lg border min-h-[44px] min-w-[44px] {$shadowStore.neumorphismConfig.lightPosition === 'bottomLeft' ? 'bg-indigo-50 border-indigo-600 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}" on:click={() => $shadowStore.neumorphismConfig.lightPosition = 'bottomLeft'}>{dict.neumorphism.directions.bottomLeft}</button>
            <button class="py-2 px-3 text-sm font-medium rounded-lg border min-h-[44px] min-w-[44px] {$shadowStore.neumorphismConfig.lightPosition === 'bottomRight' ? 'bg-indigo-50 border-indigo-600 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}" on:click={() => $shadowStore.neumorphismConfig.lightPosition = 'bottomRight'}>{dict.neumorphism.directions.bottomRight}</button>
        </div>
    </div>
</div>
