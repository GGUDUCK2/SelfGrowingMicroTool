<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let dict: any;
  export let data = {
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    photoData: '',
    linkedIn: '',
    twitter: '',
    github: ''
  };

  const dispatch = createEventDispatcher();

  let fileInput: HTMLInputElement;

  function handlePhotoUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        data.photoData = e.target?.result as string;
        dispatch('change', data);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleInput() {
    dispatch('change', data);
  }
</script>

<div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
  <h2 class="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
    {dict?.detailsTitle || 'Contact Details'}
  </h2>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="space-y-2">
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300" for="vcard-name">{dict?.name}</label>
      <input type="text" id="vcard-name" bind:value={data.name} on:input={handleInput} placeholder="e.g. Tech Innovator" class="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]" />
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300" for="vcard-email">{dict?.email}</label>
      <input type="email" id="vcard-email" bind:value={data.email} on:input={handleInput} placeholder="e.g. hello@example.com" class="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]" />
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300" for="vcard-phone">{dict?.phone}</label>
      <input type="tel" id="vcard-phone" bind:value={data.phone} on:input={handleInput} placeholder="e.g. +1 234 567 890" class="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]" />
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300" for="vcard-company">{dict?.company}</label>
      <input type="text" id="vcard-company" bind:value={data.company} on:input={handleInput} placeholder="e.g. Acme Corp" class="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]" />
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300" for="vcard-title">{dict?.titleLabel}</label>
      <input type="text" id="vcard-title" bind:value={data.title} on:input={handleInput} placeholder="e.g. Software Engineer" class="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]" />
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300" for="vcard-website">{dict?.website}</label>
      <input type="url" id="vcard-website" bind:value={data.website} on:input={handleInput} placeholder="e.g. https://example.com" class="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]" />
    </div>

    <div class="space-y-2 md:col-span-2">
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300" for="vcard-address">{dict?.address}</label>
      <textarea id="vcard-address" bind:value={data.address} on:input={handleInput} placeholder="e.g. 123 Main St, City, Country" class="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"></textarea>
    </div>

    <!-- Photo Upload -->
    <div class="space-y-2 md:col-span-2">
      <div class="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict?.photoLabel}</div>
      <div class="flex items-center gap-4">
        {#if data.photoData}
          <div class="relative w-16 h-16 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 flex-shrink-0">
            <img src={data.photoData} alt="Profile preview" class="w-full h-full object-cover" />
          </div>
        {/if}
        <button
          type="button"
          on:click={() => fileInput.click()}
          class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors text-sm min-h-[44px]"
        >
          {data.photoData ? 'Change Photo' : 'Upload Photo'}
        </button>
        {#if data.photoData}
           <button
            type="button"
            on:click={() => { data.photoData = ''; handleInput(); }}
            class="px-4 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg font-medium transition-colors text-sm min-h-[44px]"
          >
            Remove
          </button>
        {/if}
        <input type="file" accept="image/png, image/jpeg, image/webp" class="hidden" bind:this={fileInput} on:change={handlePhotoUpload} />
      </div>
    </div>
  </div>

  <div class="border-t border-slate-200 dark:border-slate-700 pt-6 mt-6">
    <h3 class="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4">{dict?.socialLabel || 'Social Links'}</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300" for="vcard-linkedin">{dict?.linkedIn}</label>
          <input type="url" id="vcard-linkedin" bind:value={data.linkedIn} on:input={handleInput} placeholder="e.g. https://linkedin.com/in/username" class="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]" />
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300" for="vcard-twitter">{dict?.twitter}</label>
          <input type="url" id="vcard-twitter" bind:value={data.twitter} on:input={handleInput} placeholder="e.g. https://twitter.com/username" class="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]" />
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300" for="vcard-github">{dict?.github}</label>
          <input type="url" id="vcard-github" bind:value={data.github} on:input={handleInput} placeholder="e.g. https://github.com/username" class="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]" />
        </div>
    </div>
  </div>

</div>
