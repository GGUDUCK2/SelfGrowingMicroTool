<script lang="ts">
  import type { QRState, QRType } from '$lib/utils/qr-forge/types';
  import QRBulk from './QRBulk.svelte';
  import { slide } from 'svelte/transition';
  import { Upload, X } from 'lucide-svelte';
  import { dictionaries } from '$lib/dictionaries';

  export let state: QRState;
  type Dictionary = typeof dictionaries.en;
  export let dictionary: Dictionary;

  // Helper to ensure objects exist if type changes
  $: if (state.type === 'wifi' && !state.wifi) {
    state.wifi = { ssid: '', encryption: 'WPA', hidden: false };
  }
  $: if (state.type === 'vcard' && !state.vcard) {
    state.vcard = { firstName: '', lastName: '', phone: '', email: '' };
  }
  $: if (state.type === 'email' && !state.email) {
    state.email = { to: '', subject: '', body: '' };
  }
  $: if (state.type === 'sms' && !state.sms) {
    state.sms = { phone: '', message: '' };
  }
  $: if (state.type === 'crypto' && !state.crypto) {
    state.crypto = { currency: 'BTC', address: '' };
  }
  $: if (state.type === 'bulk' && !state.bulk) {
    state.bulk = { items: '' };
  }

  // Ensure branding defaults
  $: if (!state.design.logoSize) state.design.logoSize = 0.2;
  $: if (!state.design.frame) state.design.frame = 'none';

  const d = dictionary.tools.qrForge || {};

  let fileInput: HTMLInputElement;

  const handleLogoUpload = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              if (ev.target?.result && typeof ev.target.result === 'string') {
                  state.design.logo = ev.target.result;
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const clearLogo = () => {
      state.design.logo = undefined;
      if (fileInput) fileInput.value = '';
  };

  const types: QRType[] = ['url', 'text', 'wifi', 'email', 'sms', 'vcard', 'crypto', 'bulk'];
</script>

<div class="space-y-6 p-4 bg-slate-800 rounded-xl border border-slate-700 shadow-sm">
  <!-- Type Selector -->
  <div>
    <span class="block text-sm font-medium text-slate-300 mb-2">{d.type || 'Content Type'}</span>
    <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {#each types as type}
        <button
          class="px-3 py-2 text-sm rounded-lg border transition-all duration-200 min-h-[44px] min-w-[44px] {state.type === type ? 'bg-indigo-600 border-indigo-500 text-white font-medium shadow-md ring-2 ring-indigo-500/20' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-slate-500'}"
          on:click={() => state.type = type}
        >
          {d.types?.[type] || type.toUpperCase()}
        </button>
      {/each}
    </div>
  </div>

  <!-- Forms -->
  <div class="space-y-4">
    {#if state.type === 'url'}
      <div transition:slide>
        <label class="block">
          <span class="block text-sm font-medium text-slate-300 mb-1">URL</span>
          <input
            type="url"
            bind:value={state.url}
            placeholder="https://example.com"
            class="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-400 min-h-[44px]"
          />
        </label>
      </div>
    {:else if state.type === 'text'}
      <div transition:slide>
        <label class="block">
          <span class="block text-sm font-medium text-slate-300 mb-1">{d.content || 'Content'}</span>
          <textarea
            bind:value={state.text}
            rows="4"
            class="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-400 min-h-[44px]"
            placeholder={d.placeholders?.text || 'Enter text here...'}
          ></textarea>
        </label>
      </div>
    {:else if state.type === 'wifi' && state.wifi}
      <div transition:slide class="grid grid-cols-1 gap-4">
        <label class="block">
          <span class="block text-sm font-medium text-slate-300 mb-1">SSID (Network Name)</span>
          <input type="text" bind:value={state.wifi.ssid} class="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[44px]" />
        </label>
        <label class="block">
          <span class="block text-sm font-medium text-slate-300 mb-1">Password</span>
          <input type="text" bind:value={state.wifi.password} class="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[44px]" />
        </label>
        <div class="grid grid-cols-2 gap-4">
          <label class="block">
            <span class="block text-sm font-medium text-slate-300 mb-1">Encryption</span>
            <select bind:value={state.wifi.encryption} class="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[44px]">
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">None</option>
            </select>
          </label>
          <div class="flex items-center pt-6">
            <label class="flex items-center space-x-2 cursor-pointer min-h-[44px]">
              <input type="checkbox" bind:checked={state.wifi.hidden} class="w-4 h-4 rounded border-slate-600 text-indigo-600 bg-slate-700 focus:ring-indigo-500 focus:ring-offset-slate-800" />
              <span class="text-sm text-slate-300">Hidden Network</span>
            </label>
          </div>
        </div>
      </div>
    {:else if state.type === 'email' && state.email}
      <div transition:slide class="space-y-3">
        <label class="block">
          <span class="block text-sm font-medium text-slate-300 mb-1">To</span>
          <input type="email" bind:value={state.email.to} class="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-slate-50 focus:ring-2 focus:ring-indigo-500 min-h-[44px]" />
        </label>
        <label class="block">
          <span class="block text-sm font-medium text-slate-300 mb-1">Subject</span>
          <input type="text" bind:value={state.email.subject} class="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-slate-50 focus:ring-2 focus:ring-indigo-500 min-h-[44px]" />
        </label>
        <label class="block">
          <span class="block text-sm font-medium text-slate-300 mb-1">Body</span>
          <textarea rows="3" bind:value={state.email.body} class="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-slate-50 focus:ring-2 focus:ring-indigo-500 min-h-[44px]"></textarea>
        </label>
      </div>
    {:else if state.type === 'sms' && state.sms}
      <div transition:slide class="space-y-3">
        <label class="block">
          <span class="block text-sm font-medium text-slate-300 mb-1">Phone Number</span>
          <input type="tel" bind:value={state.sms.phone} class="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-slate-50 focus:ring-2 focus:ring-indigo-500 min-h-[44px]" />
        </label>
        <label class="block">
          <span class="block text-sm font-medium text-slate-300 mb-1">Message</span>
          <textarea rows="3" bind:value={state.sms.message} class="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-slate-50 focus:ring-2 focus:ring-indigo-500 min-h-[44px]"></textarea>
        </label>
      </div>
    {:else if state.type === 'vcard' && state.vcard}
      <div transition:slide class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label class="block col-span-1">
          <span class="block text-sm font-medium text-slate-300 mb-1">First Name</span>
          <input type="text" bind:value={state.vcard.firstName} class="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-slate-50 focus:ring-2 focus:ring-indigo-500 min-h-[44px]" />
        </label>
        <label class="block col-span-1">
          <span class="block text-sm font-medium text-slate-300 mb-1">Last Name</span>
          <input type="text" bind:value={state.vcard.lastName} class="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-slate-50 focus:ring-2 focus:ring-indigo-500 min-h-[44px]" />
        </label>
        <label class="block col-span-2 sm:col-span-1">
          <span class="block text-sm font-medium text-slate-300 mb-1">Phone</span>
          <input type="tel" bind:value={state.vcard.phone} class="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-slate-50 focus:ring-2 focus:ring-indigo-500 min-h-[44px]" />
        </label>
        <label class="block col-span-2 sm:col-span-1">
          <span class="block text-sm font-medium text-slate-300 mb-1">Email</span>
          <input type="email" bind:value={state.vcard.email} class="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-slate-50 focus:ring-2 focus:ring-indigo-500 min-h-[44px]" />
        </label>
        <label class="block col-span-2">
           <span class="block text-sm font-medium text-slate-300 mb-1">Organization</span>
           <input type="text" bind:value={state.vcard.org} class="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-slate-50 focus:ring-2 focus:ring-indigo-500 min-h-[44px]" />
        </label>
         <label class="block col-span-2">
           <span class="block text-sm font-medium text-slate-300 mb-1">Website</span>
           <input type="url" bind:value={state.vcard.url} class="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-slate-50 focus:ring-2 focus:ring-indigo-500 min-h-[44px]" />
        </label>
      </div>
    {:else if state.type === 'crypto' && state.crypto}
      <div transition:slide class="space-y-3">
        <label class="block">
          <span class="block text-sm font-medium text-slate-300 mb-1">Currency</span>
          <select bind:value={state.crypto.currency} class="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-slate-50 focus:ring-2 focus:ring-indigo-500 min-h-[44px]">
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="ETH">Ethereum (ETH)</option>
            <option value="SOL">Solana (SOL)</option>
          </select>
        </label>
        <label class="block">
          <span class="block text-sm font-medium text-slate-300 mb-1">Address</span>
          <input type="text" bind:value={state.crypto.address} class="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-slate-50 focus:ring-2 focus:ring-indigo-500 font-mono min-h-[44px]" />
        </label>
        <label class="block">
          <span class="block text-sm font-medium text-slate-300 mb-1">Amount (Optional)</span>
          <input type="number" step="any" bind:value={state.crypto.amount} class="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-slate-50 focus:ring-2 focus:ring-indigo-500 min-h-[44px]" />
        </label>
      </div>
    {:else if state.type === 'bulk' && state.bulk}
      <div transition:slide>
         <QRBulk bind:state {dictionary} />
      </div>
    {/if}
  </div>

  {#if state.type !== 'bulk'}
  <div class="h-px bg-slate-700 my-4"></div>

  <!-- Branding -->
  <div>
    <h3 class="text-lg font-semibold text-slate-200 mb-3">{d.branding || 'Branding & Style'}</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <!-- Logo Upload -->
        <div>
             <span class="block text-sm font-medium text-slate-300 mb-2">{d.logo || 'Center Logo'}</span>
             <div class="flex items-center gap-3">
                {#if state.design.logo}
                    <div class="relative w-12 h-12 bg-white rounded-lg p-1 border border-slate-600">
                        <img src={state.design.logo} alt="Logo" class="w-full h-full object-contain" />
                        <button on:click={clearLogo} class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Clear logo">
                            <X size={12} />
                        </button>
                    </div>
                {/if}
                <label class="flex-1">
                    <input
                        type="file"
                        accept="image/*"
                        bind:this={fileInput}
                        on:change={handleLogoUpload}
                        class="hidden"
                    />
                    <div class="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-slate-700 border border-slate-600 border-dashed rounded-lg cursor-pointer hover:bg-slate-600 transition-colors min-h-[44px]">
                        <Upload size={16} class="text-slate-400" />
                        <span class="text-sm text-slate-300">{d.uploadLogo || 'Upload Image'}</span>
                    </div>
                </label>
             </div>
             {#if state.design.logo}
                <div class="mt-2">
                    <label class="block min-h-[44px]"><span class="block text-xs text-slate-400 mb-1">{d.logoSize || 'Logo Size'}</span>
                    <input type="range" min="0.1" max="0.3" step="0.01" bind:value={state.design.logoSize} class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                    </label>
                </div>
             {/if}
        </div>

        <!-- Frame -->
        <div>
             <span class="block text-sm font-medium text-slate-300 mb-2">{d.frame || 'Frame'}</span>
             <select aria-label={d.frame || 'Frame'} bind:value={state.design.frame} class="w-full bg-slate-700 border-slate-600 rounded-lg px-3 py-2 text-slate-50 mb-2 min-h-[44px]">
                 <option value="none">{d.frameNone || 'None'}</option>
                 <option value="simple">{d.frameSimple || 'Simple Border'}</option>
                 <option value="scan_me">{d.frameScanMe || '"Scan Me" Label'}</option>
             </select>
             {#if state.design.frame && state.design.frame !== 'none'}
                <div transition:slide>
                    <input
                        type="text"
                        bind:value={state.design.frameText}
                        placeholder={d.frameTextPlaceholder || 'SCAN ME'}
                        class="w-full bg-slate-700 border-slate-600 rounded-lg px-3 py-2 text-slate-50 text-sm min-h-[44px]"
                    />
                </div>
             {/if}
        </div>
    </div>
  </div>
  {/if}

  <div class="h-px bg-slate-700 my-4"></div>

  <!-- Design -->
  <div>
    <h3 class="text-lg font-semibold text-slate-200 mb-3">{d.design || 'Design'}</h3>
    <div class="grid grid-cols-2 gap-4">
      <label class="block">
        <span class="block text-sm font-medium text-slate-300 mb-1">{d.colors?.dark || 'Foreground Color'}</span>
        <div class="flex items-center space-x-2">
            <input type="color" bind:value={state.design.colorDark} class="h-[44px] w-[44px] rounded cursor-pointer bg-transparent border-none min-h-[44px] min-w-[44px]" />
            <input type="text" bind:value={state.design.colorDark} class="flex-1 bg-slate-700 border-slate-600 rounded-lg px-3 py-2 text-slate-50 text-sm font-mono uppercase min-h-[44px]" />
        </div>
      </label>
      <label class="block">
        <span class="block text-sm font-medium text-slate-300 mb-1">{d.colors?.light || 'Background Color'}</span>
        <div class="flex items-center space-x-2">
            <input type="color" bind:value={state.design.colorLight} class="h-[44px] w-[44px] rounded cursor-pointer bg-transparent border-none min-h-[44px] min-w-[44px]" />
            <input type="text" bind:value={state.design.colorLight} class="flex-1 bg-slate-700 border-slate-600 rounded-lg px-3 py-2 text-slate-50 text-sm font-mono uppercase min-h-[44px]" />
        </div>
      </label>
      <label class="block">
        <span class="block text-sm font-medium text-slate-300 mb-1">{d.errorLevel || 'Error Correction'}</span>
        <select bind:value={state.design.errorCorrectionLevel} class="w-full bg-slate-700 border-slate-600 rounded-lg px-3 py-2 text-slate-50 min-h-[44px]">
          <option value="L">Low (7%)</option>
          <option value="M">Medium (15%)</option>
          <option value="Q">Quartile (25%)</option>
          <option value="H">High (30%)</option>
        </select>
      </label>
      <label class="block">
         <span class="block text-sm font-medium text-slate-300 mb-1">{d.margin || 'Margin'}</span>
         <input type="number" min="0" max="10" bind:value={state.design.margin} class="w-full bg-slate-700 border-slate-600 rounded-lg px-3 py-2 text-slate-50 min-h-[44px]" />
      </label>
    </div>
  </div>
</div>
