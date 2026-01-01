<script lang="ts">
  export let title: string;
  export let items: { q: string; a: string }[];
</script>

<div class="bg-indigo-900 text-white p-8 rounded-2xl shadow-lg">
  <h3 class="text-xl font-bold mb-6 flex items-center gap-2">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-help-circle"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
    {title}
  </h3>
  <div class="space-y-6">
    {#each items as item}
      <div>
        <h4 class="font-semibold text-indigo-200 mb-2">{item.q}</h4>
        <p class="text-indigo-100 text-sm leading-relaxed">{item.a}</p>
      </div>
    {/each}
  </div>
</div>
