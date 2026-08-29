<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let dict: Record<string, string> = {};;
  export let data: Record<string, string> = {
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
    github: '',
    qrFgColor: '#0f172a',
    qrBgColor: '#ffffff',
    format: '3.0'
  };

  const dispatch = createEventDispatcher();

  let fileInput: HTMLInputElement;


  // Keyboard shortcuts and drag state
  let isDragging = false;

  // 1. Profile strength analyzer
  $: profileStrength = calculateStrength(data);
  $: strengthColor = profileStrength < 40 ? 'bg-rose-500' : profileStrength < 80 ? 'bg-amber-500' : 'bg-emerald-500';
  $: strengthText = profileStrength < 40 ? 'Basic' : profileStrength < 80 ? 'Good' : 'Strong';

  function calculateStrength(d: Record<string, string>) {
    let score = 0;
    if (d.name) score += 25;
    if (d.email) score += 20;
    if (d.phone) score += 20;
    if (d.company || d.title) score += 15;
    if (d.photoData) score += 10;
    if (d.website || d.linkedIn || d.twitter || d.github) score += 10;
    return Math.min(score, 100);
  }

  // 2. Phone formatter
  function formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    let formatted = phone;

    // basic US format, if starts with 1 or length is 10
    if (cleaned.length === 10) {
      formatted = `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      formatted = `+1 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7)}`;
    }
    return formatted;
  }

  function handleDragEnter(e: DragEvent) {
      e.preventDefault();
      e.stopPropagation();
      isDragging = true;
  }

  function handleDragLeave(e: DragEvent) {
      e.preventDefault();
      e.stopPropagation();
      isDragging = false;
  }

  function handleDragOver(e: DragEvent) {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragging) isDragging = true;
  }

  function handleDrop(e: DragEvent) {
      e.preventDefault();
      e.stopPropagation();
      isDragging = false;

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
          const file = files[0];
          if (file.name.toLowerCase().endsWith('.vcf')) {
               const reader = new FileReader();
               reader.onload = (e) => {
                   if (e.target?.result) {
                       parseVcf(e.target.result as string);
                   }
               };
               reader.readAsText(file);
          }
      }
  }

  let importVcfInput: HTMLInputElement;

  function parseVcf(vcfText: string) {
    const lines = vcfText.split(/\r?\n/);
    const parsed = { ...data };

    for (let line of lines) {
      if (line.startsWith('FN:')) parsed.name = line.substring(3);
      else if (line.startsWith('TITLE:')) parsed.title = line.substring(6);
      else if (line.startsWith('ORG:')) parsed.company = line.substring(4);
      else if (line.startsWith('EMAIL') && line.includes(':')) parsed.email = line.split(':')[1];
      else if (line.startsWith('TEL') && line.includes(':')) parsed.phone = line.split(':')[1];
      else if (line.startsWith('URL') && line.includes(':')) {
        const url = line.split(':')[1];
        if (url.includes('linkedin.com')) parsed.linkedIn = url;
        else if (url.includes('twitter.com')) parsed.twitter = url;
        else if (url.includes('github.com')) parsed.github = url;
        else parsed.website = url;
      }
      else if (line.startsWith('ADR') && line.includes(':')) {
        const adrParts = line.split(':')[1].split(';');
        parsed.address = adrParts.filter(Boolean).join(', ');
      }
      else if (line.startsWith('PHOTO') && line.includes(';ENCODING=b:')) {
        const base64Data = line.split(';ENCODING=b:')[1];
        const typeMatch = line.match(/TYPE=([^;]+)/i);
        const type = typeMatch ? typeMatch[1].toLowerCase() : 'jpeg';
        parsed.photoData = `data:image/${type};base64,${base64Data}`;
      }
    }

    data = parsed;
    dispatch('change', data);
  }

  function handleVcfImport(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          parseVcf(e.target.result as string);
        }
        // Reset input so the same file can be imported again if needed
        if (importVcfInput) importVcfInput.value = '';
      };
      reader.readAsText(file);
    }
  }

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

  let showMagicImport = false;
  let magicImportText = '';

  const themes = [
      { name: dict?.themeCorporate || 'Corporate Blue', fg: '#0f172a', bg: '#ffffff' },
      { name: dict?.themeCyberpunk || 'Neon Cyberpunk', fg: '#ec4899', bg: '#171717' },
      { name: dict?.themeNature || 'Nature Green', fg: '#166534', bg: '#f0fdf4' },
      { name: dict?.themeSunset || 'Sunset Orange', fg: '#c2410c', bg: '#fff7ed' }
  ];

  function applyTheme(theme: { fg: string, bg: string }) {
      data.qrFgColor = theme.fg;
      data.qrBgColor = theme.bg;
      handleInput();
  }


  function processMagicImport() {
      if (!magicImportText.trim()) return;

      const emailRegex = /[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}/;
      const phoneRegex = /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?/i;
      // eslint-disable-next-line no-useless-escape
      const urlRegex = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&\/=]*)/gi;

      const emailMatch = magicImportText.match(emailRegex);
      if (emailMatch && !data.email) data.email = emailMatch[0];

      const phoneMatch = magicImportText.match(phoneRegex);
      if (phoneMatch && !data.phone) data.phone = phoneMatch[0];

      const urlMatches = magicImportText.match(urlRegex);
      if (urlMatches) {
          urlMatches.forEach(url => {
              const lowerUrl = url.toLowerCase();
              if (lowerUrl.includes('linkedin.com') && !data.linkedIn) data.linkedIn = url;
              else if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
                  if(!data.twitter) data.twitter = url;
              }
              else if (lowerUrl.includes('github.com') && !data.github) data.github = url;
              else if (!data.website) data.website = url;
          });
      }

      // Very naive extraction for Name, Title, Company based on typical signature line order
      const lines = magicImportText.split('\n').map(l => l.trim()).filter(l => l && !l.match(emailRegex) && !l.match(phoneRegex) && !l.match(urlRegex));

      if (lines.length > 0 && !data.name) {
          // Assume first valid line is name if it's short
          if (lines[0].length < 40) {
             data.name = lines[0].replace(/^(?:Best,|Regards,|Sincerely,|Thanks,)\s*/i, '').trim();
             lines.shift();
          }
      }

      if (lines.length > 0 && !data.title) {
          if (lines[0].length < 60) {
              data.title = lines[0];
              lines.shift();
          }
      }

      if (lines.length > 0 && !data.company) {
          if (lines[0].length < 60) {
              data.company = lines[0];
          }
      }

      showMagicImport = false;
      magicImportText = '';
      dispatch('change', data);
  }

  function handleInput() {
    if (data.phone) {
      data.phone = formatPhone(data.phone);
    }
    // Smart auto-completion from email/website if company is empty
    if (!data.company) {
      let domain = '';
      if (data.email && data.email.includes('@')) {
        const parts = data.email.split('@');
        if (parts.length === 2 && parts[1]) {
          domain = parts[1].split('.')[0];
        }
      } else if (data.website) {
        try {
           const url = new URL(data.website.startsWith('http') ? data.website : `https://${data.website}`);
           const hostnameParts = url.hostname.replace(/^www\./, '').split('.');
           if (hostnameParts.length > 0) {
             domain = hostnameParts[0];
           }
        } catch(e) {
            // Invalid URL, ignore
        }
      }

      if (domain && domain.length > 2 && !['gmail', 'yahoo', 'hotmail', 'outlook', 'icloud', 'me', 'mac'].includes(domain.toLowerCase())) {
         data.company = domain.charAt(0).toUpperCase() + domain.slice(1);
      }
    }
    dispatch('change', data);
  }
</script>

<div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6 relative">
  <!-- Profile Strength Analyzer -->
  <div class="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
      <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Profile Strength: {strengthText}</span>
          <span class="text-sm font-bold text-slate-900 dark:text-white">{profileStrength}%</span>
      </div>
      <div class="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div class="h-full transition-all duration-500 ease-out {strengthColor}" style="width: {profileStrength}%"></div>
      </div>
  </div>

  <div class="flex justify-between items-center">
    <h2 class="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      {dict?.detailsTitle || 'Contact Details'}
    </h2>
    <div class="flex items-center gap-4">
      <div class="flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
          <button
              on:click={() => { data.format = '3.0'; handleInput(); }}
              class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors {data.format === '3.0' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}"
              aria-label="vCard 3.0 Format"
          >
              vCard 3.0
          </button>
          <button
              on:click={() => { data.format = '4.0'; handleInput(); }}
              class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors {data.format === '4.0' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}"
              aria-label="vCard 4.0 Format"
          >
              vCard 4.0
          </button>
      </div>
      <div class="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
      <button
        type="button"
        on:click={() => importVcfInput.click()}
        class="text-sm px-3 py-1.5 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20 rounded-lg transition-colors flex items-center gap-1 min-h-[44px]"
        aria-label="Import .vcf"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {dict?.importVcf || 'Import .vcf'}
      </button>
      <input type="file" accept=".vcf" class="hidden" bind:this={importVcfInput} on:change={handleVcfImport} />

      <button
          type="button"
          on:click={() => showMagicImport = !showMagicImport}
          class="text-sm px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20 rounded-lg transition-colors flex items-center gap-1 min-h-[44px]"
          aria-label={dict?.magicImport || 'Magic Import'}
      >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          {dict?.magicImport || 'Magic Import'}
      </button>

      <button
        on:click={() => dispatch('clear')}
        class="text-sm px-3 py-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors flex items-center gap-1 min-h-[44px]"
        aria-label={dict?.clear || 'Clear Form'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        {dict?.clear || 'Clear Form'}
      </button>
    </div>
  </div>

  {#if showMagicImport}
      <div class="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50 space-y-3">
          <label class="block text-sm font-medium text-indigo-900 dark:text-indigo-200" for="magic-import-textarea">
              {dict?.magicTitle || 'Paste Email Signature'}
          </label>
          <textarea
              id="magic-import-textarea"
              bind:value={magicImportText}
              placeholder={dict?.magicPlaceholder || "John Doe\nSoftware Engineer\nAcme Corp\njohn@example.com\n+1 555-0198"}
              class="w-full p-3 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
          ></textarea>
          <div class="flex justify-end gap-2">
              <button
                  on:click={() => showMagicImport = false}
                  class="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors min-h-[44px]"
              >
                  {dict?.cancel || 'Cancel'}
              </button>
              <button
                  on:click={processMagicImport}
                  class="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 min-h-[44px]"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {dict?.extractInfo || 'Extract Info'}
              </button>
          </div>
      </div>
  {/if}


<div
  class="relative"
  on:dragenter={handleDragEnter}
  on:dragleave={handleDragLeave}
  on:dragover={handleDragOver}
  on:drop={handleDrop}
  role="region"
  aria-label="Drag and Drop Area"
>
  {#if isDragging}
    <div class="absolute inset-0 z-50 bg-indigo-500/10 dark:bg-indigo-500/20 backdrop-blur-sm border-2 border-dashed border-indigo-500 rounded-xl flex items-center justify-center pointer-events-none transition-all duration-200">
        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl flex flex-col items-center transform scale-110">
            <div class="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
            </div>
            <p class="text-lg font-bold text-slate-800 dark:text-white">{dict?.dropVcfHere || 'Drop .vcf file here'}</p>
        </div>
    </div>
  {/if}

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
      <div class="flex items-center justify-between">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300" for="vcard-phone">{dict?.phone}</label>
        {#if data.phone && !/^\+?[\d\s\-()]+$/.test(data.phone)}
            <span class="text-xs text-rose-500 font-medium">Invalid format</span>
        {/if}
      </div>
      <input type="tel" id="vcard-phone" bind:value={data.phone} on:input={handleInput} placeholder="e.g. +1 234 567 890" class="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]" class:border-rose-300={data.phone && !/^\+?[\d\s\-()]+$/.test(data.phone)} />
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
      <div class="flex items-center justify-between">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300" for="vcard-address">{dict?.address}</label>
          <button type="button" on:click={() => { if(data.address) data.address = data.address.trim().replace(/\n+/g, ', '); handleInput(); }} class="text-xs text-indigo-500 hover:text-indigo-600 font-medium">Auto-format (One Line)</button>
      </div>
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
    <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-slate-600 dark:text-slate-400">{dict?.qrColors || 'QR Code Colors'}</h3>
        <div class="flex items-center gap-2">
            {#each themes as theme (theme.name)}
                <button
                    type="button"
                    on:click={() => applyTheme(theme)}
                    class="w-6 h-6 rounded-full border-2 border-slate-200 dark:border-slate-700 shadow-sm transition-transform hover:scale-110"
                    style="background: linear-gradient(135deg, {theme.fg} 50%, {theme.bg} 50%);"
                    title={theme.name}
                    aria-label={`Apply ${theme.name} theme`}
                ></button>
            {/each}
        </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300" for="vcard-qr-fg">{dict?.qrFgColor || 'Foreground Color'}</label>
          <div class="flex items-center gap-2">
            <input type="color" id="vcard-qr-fg" bind:value={data.qrFgColor} on:input={handleInput} class="h-11 w-11 p-1 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer" />
            <input type="text" bind:value={data.qrFgColor} on:input={handleInput} class="flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]" />
          </div>
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300" for="vcard-qr-bg">{dict?.qrBgColor || 'Background Color'}</label>
          <div class="flex items-center gap-2">
            <input type="color" id="vcard-qr-bg" bind:value={data.qrBgColor} on:input={handleInput} class="h-11 w-11 p-1 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer" />
            <input type="text" bind:value={data.qrBgColor} on:input={handleInput} class="flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]" />
          </div>
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

</div>