<script lang="ts">
  import type { ColorData, ColorMasterDictionary, ScaleStep } from '$lib/types/color-master';

  export let palette: ColorData[] = [];
  export let baseColor: string;
  export let scale: ScaleStep[] = [];
  export let t: ColorMasterDictionary;

  let copiedMode = '';
  let canvas: HTMLCanvasElement;

  function generateCSS() {
    return `:root {
  --color-primary: ${baseColor};
${palette.map((c, i) => `  --color-harmony-${i + 1}: ${c.hex};`).join('\n')}
}`;
  }

  function generateTailwind() {
    const scaleObj = scale.reduce((acc, curr) => {
        acc[curr.step] = curr.hex;
        return acc;
    }, {} as any);

    return `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '${baseColor}',
          ${Object.entries(scaleObj).map(([k, v]) => `'${k}': '${v}',`).join('\n          ')}
        },
        harmonies: {
          ${palette.map((c, i) => `'${i + 1}': '${c.hex}',`).join('\n          ')}
        }
      }
    }
  }
}`;
  }

  function generateSCSS() {
    return `$color-primary: ${baseColor};
${palette.map((c, i) => `$color-harmony-${i + 1}: ${c.hex};`).join('\n')}`;
  }

  function generateJSON() {
    return JSON.stringify({
      primary: baseColor,
      harmonies: palette.map(c => c.hex)
    }, null, 2);
  }

  function generateUrl() {
    return window.location.href;
  }

  async function copyCode(generator: () => string, mode: string) {
    const code = generator();

    if (mode === 'URL' && navigator.share) {
        try {
            await navigator.share({
                title: 'Lumina Palette',
                text: 'Check out this color palette created with Lumina',
                url: code
            });
            copiedMode = mode;
        } catch (err) {
            // Fallback to clipboard
            navigator.clipboard.writeText(code);
            copiedMode = mode;
        }
    } else {
        navigator.clipboard.writeText(code);
        copiedMode = mode;
    }

    setTimeout(() => copiedMode = '', 2000);
  }

  async function downloadImage() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas Settings
    const width = 1200;
    const height = 630;
    canvas.width = width;
    canvas.height = height;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.font = 'bold 48px sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.fillText('Lumina Palette', width / 2, 80);

    // Primary Color
    const centerX = width / 2;
    const centerY = height / 2;

    // Draw Primary
    drawColorCircle(ctx, centerX, centerY - 50, 80, baseColor, 'Primary');

    // Draw Harmonies
    const radius = 60;
    const spread = 150;
    const startX = centerX - ((palette.length - 1) * spread) / 2;

    palette.forEach((c, i) => {
        drawColorCircle(ctx, startX + (i * spread), centerY + 150, radius, c.hex, c.name);
    });

    // Copyright
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Generated with Lumina', width / 2, height - 30);

    // Download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `lumina-palette-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();

    copiedMode = 'Image';
    setTimeout(() => copiedMode = '', 2000);
  }

  function drawColorCircle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, label: string) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.closePath();

      // Shadow
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;

      // Reset Shadow for text
      ctx.shadowColor = 'transparent';

      ctx.font = 'bold 20px monospace';
      ctx.fillStyle = '#334155';
      ctx.fillText(color.toUpperCase(), x, y + r + 30);

      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText(label, x, y + r + 50);
  }

</script>

<canvas bind:this={canvas} class="hidden"></canvas>

<div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
  <h3 class="text-lg font-semibold mb-4 text-slate-900 dark:text-white">{t.export}</h3>

  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
    <button
      class="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      on:click={() => copyCode(generateCSS, 'CSS')}
    >
      <span class="font-bold text-slate-700 dark:text-slate-200">CSS</span>
      <span class="text-xs text-slate-500 mt-1">{copiedMode === 'CSS' ? t.copied : 'Variables'}</span>
    </button>

    <button
      class="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      on:click={() => copyCode(generateTailwind, 'Tailwind')}
    >
      <span class="font-bold text-sky-500">Tailwind</span>
      <span class="text-xs text-slate-500 mt-1">{copiedMode === 'Tailwind' ? t.copied : 'Config'}</span>
    </button>

    <button
      class="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      on:click={() => copyCode(generateSCSS, 'SCSS')}
    >
      <span class="font-bold text-pink-500">SCSS</span>
      <span class="text-xs text-slate-500 mt-1">{copiedMode === 'SCSS' ? t.copied : 'Variables'}</span>
    </button>

    <button
      class="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      on:click={() => copyCode(generateJSON, 'JSON')}
    >
      <span class="font-bold text-amber-500">JSON</span>
      <span class="text-xs text-slate-500 mt-1">{copiedMode === 'JSON' ? t.copied : 'Object'}</span>
    </button>

    <button
      class="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      on:click={() => copyCode(generateUrl, 'URL')}
    >
      <span class="font-bold text-indigo-500">URL</span>
      <span class="text-xs text-slate-500 mt-1">{copiedMode === 'URL' ? t.copied : 'Share Link'}</span>
    </button>

    <button
      class="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      on:click={downloadImage}
    >
      <span class="font-bold text-teal-500">Image</span>
      <span class="text-xs text-slate-500 mt-1">{copiedMode === 'Image' ? 'Saved!' : 'Download'}</span>
    </button>
  </div>
</div>
