<script lang="ts">
  import { onMount, tick } from 'svelte';
  import QRCode from 'qrcode';

  export let dict: Record<string, string> = {};
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
    qrFgColor: string;
    qrBgColor: string;
    format: string;
  };

  let qrCanvas: HTMLCanvasElement;
  let qrDataUrl = '';
  let qrSvgString = '';
  let vcardData = '';
  let downloadUrl = '';
  let showCopiedToast = false;
  let showRaw = false;
  let completionPercentage = 0;

  let nextSteps: string[] = [];
  $: {
    let score = 0;
    let total = 0;
    let suggestions: string[] = [];

    const weights = [
        { field: data.name, weight: 20, missingTip: dict?.addName || "Add your full name to start your profile." },
        { field: data.phone, weight: 15, missingTip: dict?.addPhone || "Add a phone number to make contacting you easy." },
        { field: data.email, weight: 15, missingTip: dict?.addEmail || "Add an email address for professional inquiries." },
        { field: data.title, weight: 10, missingTip: dict?.addTitle || "Add your job title to establish your role." },
        { field: data.company, weight: 10, missingTip: dict?.addCompany || "Add your company name to build trust." },
        { field: data.photoData, weight: 15, missingTip: dict?.profileTipPhoto || "Add a profile photo to boost engagement by 40%." },
        { field: data.website, weight: 5, missingTip: dict?.profileTipWebsite || "Add your website link for better conversion." },
        { field: data.linkedIn || data.twitter || data.github, weight: 10, missingTip: dict?.addSocial || "Add at least one social link (LinkedIn recommended)." }
    ];

    weights.forEach(w => {
        total += w.weight;
        if (w.field && typeof w.field === 'string' && w.field.trim().length > 0) {
            score += w.weight;
        } else if (w.field && typeof w.field !== 'string') {
            score += w.weight;
        } else {
            suggestions.push(w.missingTip);
        }
    });

    completionPercentage = Math.round((score / total) * 100);
    nextSteps = suggestions;
  }


  $: if (data) {
    generateVCard();
  }

  function generateVCard() {
    const isV4 = data.format === '4.0';
    let vcf = `BEGIN:VCARD\nVERSION:${isV4 ? '4.0' : '3.0'}\n`;

    if (data.name) {
      vcf += `FN:${data.name}\n`;
      vcf += `N:${data.name.split(' ').reverse().join(';')};;;\n`;
    }
    if (data.company) vcf += `ORG:${data.company}\n`;
    if (data.title) vcf += `TITLE:${data.title}\n`;

    if (data.phone) {
        vcf += isV4 ? `TEL;TYPE=cell,voice;VALUE=uri:tel:${data.phone.replace(/[\s-]/g, '')}\n` : `TEL;TYPE=CELL:${data.phone}\n`;
    }

    if (data.email) {
        vcf += isV4 ? `EMAIL;TYPE=work:${data.email}\n` : `EMAIL;TYPE=WORK,INTERNET:${data.email}\n`;
    }

    if (data.website) vcf += `URL:${data.website}\n`;
    if (data.address) {
        vcf += `ADR;TYPE=WORK:;;${data.address.replace(/\n/g, ';')}\n`;
        vcf += isV4 ? `URL;TYPE=Map:https://maps.google.com/?q=${encodeURIComponent(data.address)}\n` : `URL;type=Map:https://maps.google.com/?q=${encodeURIComponent(data.address)}\n`;
    }

    if (data.linkedIn) {
        vcf += isV4 ? `URL;TYPE=LinkedIn:${data.linkedIn}\n` : `URL;type=LinkedIn:${data.linkedIn}\n`;
    }
    if (data.twitter) {
        vcf += isV4 ? `URL;TYPE=Twitter:${data.twitter}\n` : `URL;type=Twitter:${data.twitter}\n`;
    }
    if (data.github) {
        vcf += isV4 ? `URL;TYPE=GitHub:${data.github}\n` : `URL;type=GitHub:${data.github}\n`;
    }

    let vcardForQr = vcf + `END:VCARD\n`;

    if (data.photoData) {
      const b64 = data.photoData.split(',')[1];
      if (b64) {
          if (isV4) {
              vcf += `PHOTO:data:image/jpeg;base64,${b64}\n`;
          } else {
              vcf += `PHOTO;ENCODING=b;TYPE=JPEG:${b64}\n`;
          }
      }
    }

    vcf += `END:VCARD\n`;
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
                    dark: data.qrFgColor || '#0f172a',
                    light: data.qrBgColor || '#ffffff'
                }
            });
            qrDataUrl = qrCanvas.toDataURL('image/png');
            if (data.photoData) {
                const img = new Image();
                img.src = data.photoData;
                await new Promise((resolve) => {
                    img.onload = () => {
                        const ctx = qrCanvas.getContext('2d');
                        if (ctx) {
                            const size = qrCanvas.width;
                            const logoSize = size * 0.25; // 25% of QR code size
                            const center = size / 2;

                            // Draw white circle background
                            ctx.fillStyle = '#ffffff';
                            ctx.beginPath();
                            ctx.arc(center, center, logoSize / 2 + 4, 0, Math.PI * 2);
                            ctx.fill();

                            // Draw circular image
                            ctx.save();
                            ctx.beginPath();
                            ctx.arc(center, center, logoSize / 2, 0, Math.PI * 2);
                            ctx.clip();
                            ctx.drawImage(img, center - logoSize / 2, center - logoSize / 2, logoSize, logoSize);
                            ctx.restore();

                            qrDataUrl = qrCanvas.toDataURL('image/png');
                        }
                        resolve(null);
                    };
                    img.onerror = () => resolve(null);
                });
            }


            qrSvgString = await QRCode.toString(vcardPayload, {
                type: 'svg',
                margin: 2,
                color: {
                    dark: data.qrFgColor || '#0f172a',
                    light: data.qrBgColor || '#ffffff'
                }
            });
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

  function downloadQr(type: 'png' | 'svg' = 'png') {
    if (type === 'png') {
        if (!qrDataUrl) return;
        const a = document.createElement('a');
        a.href = qrDataUrl;
        a.download = `${data.name ? data.name.replace(/\s+/g, '_') : 'contact'}_qr.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        if (!qrSvgString) return;
        const blob = new Blob([qrSvgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.name ? data.name.replace(/\s+/g, '_') : 'contact'}_qr.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
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
    <div class="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-2">
        <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {dict?.preview || 'Live Preview'}
            </h2>
            <button
                on:click={() => showRaw = !showRaw}
                class="text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 font-medium min-h-[44px]"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                {showRaw ? (dict?.viewVisual || 'Visual') : (dict?.viewRaw || 'Raw VCF')}
            </button>
        </div>
        <div class="flex items-center gap-3 w-full mt-1">
            <div class="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                <div class="h-full bg-indigo-500 transition-all duration-500" style="width: {completionPercentage}%"></div>
            </div>
            <span class="text-xs font-semibold text-slate-500 min-w-[2.5rem] text-right">{completionPercentage}%</span>
        </div>
        {#if nextSteps.length > 0}
            <div class="w-full mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg">
                <p class="text-xs font-semibold text-indigo-700 dark:text-indigo-400 mb-1 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {dict?.nextStep || 'Next Step to Boost Profile'}:
                </p>
                <p class="text-xs text-indigo-600 dark:text-indigo-300 ml-4.5">{nextSteps[0]}</p>
            </div>
        {/if}
    </div>
    <!-- Content Area -->
    <div class="flex-1 p-6 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 relative overflow-hidden">
        {#if showRaw}
            <div class="w-full h-full bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-auto shadow-inner whitespace-pre-wrap">
                {vcardData}
            </div>
        {:else}
            <div class="w-full max-w-[320px] rounded-[2rem] shadow-xl border-4 overflow-hidden flex flex-col"
                 style="background-color: {data.qrBgColor || '#ffffff'}; border-color: {data.qrFgColor || '#94a3b8'};">
                <!-- Top Notch -->
                <div class="h-6 w-full flex justify-center bg-slate-800 dark:bg-slate-950 pt-1">
                    <div class="w-20 h-4 bg-black rounded-b-xl"></div>
                </div>

                <!-- Card Content -->
                <div class="flex-1 overflow-y-auto p-6 flex flex-col items-center space-y-4 no-scrollbar">

                    <!-- Avatar -->
                    <div class="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 border-4 shadow-sm overflow-hidden flex-shrink-0 flex items-center justify-center"
                         style="border-color: {data.qrFgColor || '#ffffff'};">
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
                        <h3 class="text-xl font-bold truncate" title={data.name} style="color: {data.qrFgColor || '#0f172a'}">{data.name || 'Your Name'}</h3>
                        <p class="text-sm font-medium text-indigo-500 truncate" title={data.title}>{data.title || 'Job Title'}</p>
                        <p class="text-xs text-slate-500 dark:text-slate-400 truncate" title={data.company}>{data.company || 'Company'}</p>
                    </div>

                    <!-- QR Code -->
                    <div class="mt-4 p-2 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center gap-1 transition-colors" style="background-color: {data.qrBgColor || '#ffffff'}">
                        <canvas bind:this={qrCanvas} class="w-40 h-40" class:hidden={showRaw}></canvas>
                        <span class="text-[10px] font-semibold uppercase tracking-wider" style="color: {data.qrFgColor || '#94a3b8'}">{dict?.scanMe || 'Scan Me'}</span>
                    </div>
                </div>
            </div>
        {/if}
    </div>


    <!-- Actions -->
    <div class="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-3 relative">
        {#if showCopiedToast}
            <div class="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-sm px-3 py-1.5 rounded-lg shadow-lg pointer-events-none transition-opacity">
                {dict?.copied || 'Copied to clipboard!'}
            </div>
        {/if}
        <div class="grid grid-cols-2 gap-3">
            <button
                on:click={downloadVcf}
                disabled={!data.name}
                class="col-span-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 min-h-[44px] shadow-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
                {dict?.downloadVcf || 'Download .vcf'}
            </button>
            <button
                on:click={() => downloadQr('png')}
                disabled={!data.name}
                class="py-3 px-4 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:bg-slate-100 disabled:dark:bg-slate-800/50 disabled:text-slate-400 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 min-h-[44px] shadow-sm"
                aria-label={dict?.downloadQrPng || 'QR PNG'}
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span class="hidden sm:inline">PNG</span>
            </button>
            <button
                on:click={() => downloadQr('svg')}
                disabled={!data.name}
                class="py-3 px-4 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:bg-slate-100 disabled:dark:bg-slate-800/50 disabled:text-slate-400 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 min-h-[44px] shadow-sm"
                aria-label={dict?.downloadSvg || 'QR SVG'}
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span class="hidden sm:inline">SVG</span>
            </button>
        </div>
        <div class="grid grid-cols-2 gap-3">
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