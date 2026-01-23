<script lang="ts">
  export let value: number;
  export let id: string;
  export let min = 1;
  export let max = 10;
  export let onChange: (val: number) => void;
</script>

<div class="flex items-center gap-2" title="Weight: {value}">
  <input
    id="weight-{id}"
    type="range"
    {min}
    {max}
    value={value}
    on:input={(e) => onChange(Number(e.currentTarget.value))}
    class="w-16 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-600 hover:accent-indigo-500"
    aria-label="Weight"
  />
  <span class="text-xs font-mono w-4 text-gray-500 text-right">{value}</span>
</div>
