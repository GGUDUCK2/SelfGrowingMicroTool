<script lang="ts">
  import { onMount, tick } from 'svelte';
  import QRCode from 'qrcode';

  export let dict: any;
  export let data: {
    name: string;
    title: string;
    company: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    photoData: string;
    linkedIn: string;
    twitter: string;
    github: string;
  };

  let qrCanvas: HTMLCanvasElement;
  let qrDataUrl = '';
  let vcardData = '';
  let downloadUrl = '';
  let showCopiedToast = false;

  $: if (data) {
    generateVCard();
  }

  function generateVCard() {
    let vcf = `BEGIN:VCARD\nVERSION:3.0\n`;

    if (data.name) {
      vcf += `FN:${data.name}\n`;
      vcf += `N:${data.name.split(' ').reverse().join(';')};;;\n`;
    }
    if (data.company) vcf += `ORG:${data.company}\n`;
    if (data.title) vcf += `TITLE:${data.title}\n`;
    if (data.phone) vcf += `TEL;TYPE=CELL:${data.phone}\n`;
    if (data.email) vcf += `EMAIL;TYPE=WORK,INTERNET:${data.email}\n`;
    if (data.website) vcf += `URL:${data.website}\n`;
    if (data.address) vcf += `ADR;TYPE=WORK:;;${data.address.replace(/\n/g, ';')}\n`;

    if (data.linkedIn) vcf += `URL;type=LinkedIn:${data.linkedIn}\n`;
    if (data.twitter) vcf += `URL;type=Twitter:${data.twitter}\n`;
    if (data.github) vcf += `URL;type=GitHub:${data.github}\n`;

    if (data.photoData) {
      // Extract base64 without data type prefix
      const b64 = data.photoData.split(',')[1];
      if (b64) {
          vcf += `PHOTO;ENCODING=b;TYPE=JPEG:${b64}\n`;
      }
    }


    let vcardForQr = vcf + `END:VCARD`;

    if (data.photoData) {
      const b64 = data.photoData.split(',')[1];
      if (b64) {
          vcf += `PHOTO;ENCODING=b;TYPE=JPEG:${b64}\n`;
      }
    }

    vcf += `END:VCARD`;
    vcardData = vcf;

    const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8' });
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    downloadUrl = URL.createObjectURL(blob);

    generateQR(vcardForQr);

  }

  async function generateQR(vcardPayload: string) {
    await tick();
    if (qrCanvas && vcardData) {
        try {
            await QRCode.toCanvas(qrCanvas, vcardPayload, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#0f172a', // slate-900
                    light: '#ffffff'
                }
            });
            qrDataUrl = qrCanvas.toDataURL('image/png');
        } catch (err) {
            // Intentionally swallow error to meet no console log constraint
        }
    }
  }

  function downloadVcf() {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${data.name ? data.name.replace(/\s+/g, '_') : 'contact'}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function downloadQr() {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${data.name ? data.name.replace(/\s+/g, '_') : 'contact'}_qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function copyVcfToClipboard() {
      if (!vcardData) return;
      try {
          await navigator.clipboard.writeText(vcardData);
          showCopiedToast = true;
          setTimeout(() => showCopiedToast = false, 2000);
      } catch (err) {
          // Intentionally swallow error
      }
  }

  async function shareVCard() {
      if (!vcardData || !data.name) return;
      try {
          const file = new File([vcardData], `${data.name.replace(/\s+/g, '_')}.vcf`, { type: 'text/vcard' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                  files: [file],
                  title: `${data.name} Contact Info`,
                  text: 'Here is my digital business card.'
              });
          } else {
              // Fallback to copy
              await copyVcfToClipboard();
          }
      } catch (err) {
          if ((err as Error).name !== 'AbortError') {
              await copyVcfToClipboard();
          }
      }
  }

  onMount(() => {
      generateVCard();
  });
</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full">
    <!-- Header -->
    <div class="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
        <h2 class="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {dict?.preview || 'Live Preview'}
        </h2>
    </div>

    <!-- Phone Simulator -->
    <div class="flex-1 p-6 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 relative overflow-hidden">

        <div class="w-full max-w-[320px] bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl border-4 border-slate-300 dark:border-slate-700 overflow-hidden flex flex-col">
            <!-- Top Notch -->
            <div class="h-6 w-full flex justify-center bg-slate-800 dark:bg-slate-950 pt-1">
                <div class="w-20 h-4 bg-black rounded-b-xl"></div>
            </div>

            <!-- Card Content -->
            <div class="flex-1 overflow-y-auto p-6 flex flex-col items-center space-y-4 no-scrollbar">

                <!-- Avatar -->
                <div class="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 border-4 border-white dark:border-slate-800 shadow-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {#if data.photoData}
                        <img src={data.photoData} alt="Avatar" class="w-full h-full object-cover" />
                    {:else}
                        <svg class="w-12 h-12 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    {/if}
                </div>

                <!-- Identity -->
                <div class="text-center space-y-1 w-full">
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white truncate" title={data.name}>{data.name || 'Your Name'}</h3>
                    <p class="text-sm font-medium text-indigo-500 truncate" title={data.title}>{data.title || 'Job Title'}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400 truncate" title={data.company}>{data.company || 'Company'}</p>
                </div>

                <!-- QR Code -->
                <div class="mt-4 p-2 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col items-center gap-1">
                    <canvas bind:this={qrCanvas} class="w-40 h-40"></canvas>
                    <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{dict?.scanMe || 'Scan Me'}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Actions -->
    <div class="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-3 relative">
        {#if showCopiedToast}
            <div class="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-sm px-3 py-1.5 rounded-lg shadow-lg pointer-events-none transition-opacity">
                {dict?.copied || 'Copied to clipboard!'}
            </div>
        {/if}
        <div class="flex gap-3">
            <button
                on:click={downloadVcf}
                disabled={!data.name}
                class="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 min-h-[44px] shadow-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
                <span class="hidden sm:inline">{dict?.downloadVcf || 'Download .vcf'}</span>
                <span class="sm:hidden">.vcf</span>
            </button>
            <button
                on:click={downloadQr}
                disabled={!data.name}
                class="flex-1 py-3 px-4 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:bg-slate-100 disabled:dark:bg-slate-800/50 disabled:text-slate-400 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 min-h-[44px] shadow-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span class="hidden sm:inline">{dict?.downloadQr || 'Download QR'}</span>
                <span class="sm:hidden">QR</span>
            </button>
        </div>
        <div class="flex gap-3">
            <button
                on:click={copyVcfToClipboard}
                disabled={!data.name}
                class="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {dict?.copyVcf || 'Copy VCF'}
            </button>
            <button
                on:click={shareVCard}
                disabled={!data.name}
                class="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {dict?.share || 'Share'}
            </button>
        </div>
    </div>
</div>

<style lang="postcss">
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>