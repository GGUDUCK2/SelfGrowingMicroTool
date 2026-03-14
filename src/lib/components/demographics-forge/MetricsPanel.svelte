<script lang="ts">
    import type { DemographicSnapshot } from './data';

    export let snapshot: DemographicSnapshot;
    export let compareSnapshot: DemographicSnapshot | null = null;
    export let t: Record<string, any>;

    function formatNum(num: number) {
        return new Intl.NumberFormat('en-US').format(num);
    }
</script>

<div class="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
    <!-- Total Population -->
    <div class="bg-surface border border-border/50 rounded-xl p-4 flex flex-col justify-between shadow-sm">
        <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t.totalPopulation}</h3>
        <div class="text-2xl font-bold tracking-tight text-primary">
            {formatNum(snapshot.totalPopulation)}<span class="text-sm font-normal text-muted-foreground ml-1">k</span>
        </div>
        {#if compareSnapshot}
            <div class="text-xs mt-1 {snapshot.totalPopulation > compareSnapshot.totalPopulation ? 'text-green-500' : 'text-orange-500'}">
                vs {formatNum(compareSnapshot.totalPopulation)}k
            </div>
        {/if}
    </div>

    <!-- Median Age -->
    <div class="bg-surface border border-border/50 rounded-xl p-4 flex flex-col justify-between shadow-sm">
        <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t.medianAge}</h3>
        <div class="text-2xl font-bold tracking-tight text-primary">
            {snapshot.medianAge.toFixed(1)} <span class="text-sm font-normal text-muted-foreground ml-1">{t.years}</span>
        </div>
        {#if compareSnapshot}
            <div class="text-xs mt-1 text-muted-foreground">
                vs {compareSnapshot.medianAge.toFixed(1)} {t.years}
            </div>
        {/if}
    </div>

    <!-- Dependency Ratio -->
    <div class="bg-surface border border-border/50 rounded-xl p-4 flex flex-col justify-between shadow-sm" title="{t.dependencyTooltip}">
        <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t.dependencyRatio}</h3>
        <div class="text-2xl font-bold tracking-tight text-primary">
            {snapshot.dependencyRatio.toFixed(1)}<span class="text-sm font-normal text-muted-foreground ml-1">%</span>
        </div>
        {#if compareSnapshot}
            <div class="text-xs mt-1 text-muted-foreground">
                vs {compareSnapshot.dependencyRatio.toFixed(1)}%
            </div>
        {/if}
    </div>

    <!-- Working Age -->
    <div class="bg-surface border border-border/50 rounded-xl p-4 flex flex-col justify-between shadow-sm">
        <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t.workingAge} (15-64)</h3>
        <div class="text-2xl font-bold tracking-tight text-primary">
            {snapshot.workingAgePercent.toFixed(1)}<span class="text-sm font-normal text-muted-foreground ml-1">%</span>
        </div>
        {#if compareSnapshot}
            <div class="text-xs mt-1 text-muted-foreground">
                vs {compareSnapshot.workingAgePercent.toFixed(1)}%
            </div>
        {/if}
    </div>
</div>
