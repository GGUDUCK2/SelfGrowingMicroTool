<script lang="ts">
  import { calculateCollisionProbability } from '$lib/utils/id-forge/id-forge';

  let length = 21; // NanoID default
  let alphabetSize = 64; // URL safe
  let count = 1000000;

  $: probability = calculateCollisionProbability(length, alphabetSize, count);
  $: percent = (probability * 100).toFixed(10); // High precision
  $: yearsTo1Percent = calculateTimeToCollision(0.01);

  function calculateTimeToCollision(targetProb: number): string {
    // This is a complex inversion, we can use an approximation or just show generic "Time to 1% collision at X rate"
    // Let's invert the approximation: n ~= sqrt(2 * d * ln(1/(1-p)))
    // And assume rate is `count` per second.
    const d = Math.pow(alphabetSize, length);
    const n = Math.sqrt(2 * d * Math.log(1 / (1 - targetProb)));

    // n is total IDs generated.
    // If we generate `count` per second:
    const seconds = n / count;

    if (seconds < 60) return `${seconds.toFixed(2)} seconds`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(2)} minutes`;
    if (seconds < 86400) return `${(seconds / 3600).toFixed(2)} hours`;
    if (seconds < 31536000) return `${(seconds / 86400).toFixed(2)} days`;

    const years = seconds / 31536000;
    if (years > 1e9) return "Billions of years";
    return `${Math.floor(years).toLocaleString()} years`;
  }
</script>

<div class="space-y-8">
    <div class="grid md:grid-cols-3 gap-6">
        <div class="space-y-2">
            <label for="col-length" class="block text-sm font-medium text-slate-700 dark:text-slate-300">ID Length</label>
            <input id="col-length" type="number" bind:value={length} class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800" />
        </div>
        <div class="space-y-2">
            <label for="col-alpha" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Alphabet Size</label>
            <input id="col-alpha" type="number" bind:value={alphabetSize} class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800" />
            <p class="text-xs text-slate-500">64 for URL-safe, 36 for a-z0-9</p>
        </div>
        <div class="space-y-2">
            <label for="col-rate" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Generation Rate (IDs/sec)</label>
            <input id="col-rate" type="number" bind:value={count} class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800" />
        </div>
    </div>

    <div class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <h3 class="text-lg font-medium opacity-90 mb-2">Time to 1% Probability of Collision</h3>
        <p class="text-4xl font-bold tracking-tight">{yearsTo1Percent}</p>
        <div class="mt-6 pt-6 border-t border-white/20">
            <p class="text-sm opacity-80">Probability of collision after generating {count.toLocaleString()} IDs in total:</p>
            <p class="text-xl font-mono mt-1">{percent}%</p>
        </div>
    </div>

    <div class="text-sm text-slate-500 dark:text-slate-400">
        <p>This calculator uses the Birthday Paradox approximation to estimate when a collision is likely to occur.</p>
    </div>
</div>
