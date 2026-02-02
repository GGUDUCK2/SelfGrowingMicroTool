import { generateHTML, generateCSS } from './codegen';
import type { GridState } from './types';
import { COLOR_MAP } from './constants';
import JSZip from 'jszip';

export async function downloadProjectZip(state: GridState) {
    const zip = new JSZip();
    const html = generateHTML(state);
    const css = generateCSS(state);

    zip.file("index.html", html);
    zip.file("style.css", css);
    zip.file("README.md", `# Grid Master Project\n\nGenerated with Grid Master.\n\n## Files\n- index.html: Self-contained preview\n- style.css: Raw CSS styles`);

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "grid-master-project.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export async function downloadPNG(state: GridState, theme = 'standard') {
    const svgString = generateSVG(state, theme);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        canvas.toBlob((pngBlob) => {
            if (pngBlob) {
                const pngUrl = URL.createObjectURL(pngBlob);
                const a = document.createElement('a');
                a.href = pngUrl;
                a.download = `grid-master-${theme}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(pngUrl);
            }
            URL.revokeObjectURL(url);
        });
    };

    img.src = url;
}

export function openInStackBlitz(html: string) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://stackblitz.com/run';
    form.target = '_blank';

    const inputHtml = document.createElement('input');
    inputHtml.type = 'hidden';
    inputHtml.name = 'project[files][index.html]';
    inputHtml.value = html;
    form.appendChild(inputHtml);

    const inputTitle = document.createElement('input');
    inputTitle.type = 'hidden';
    inputTitle.name = 'project[title]';
    inputTitle.value = 'Grid Master Layout';
    form.appendChild(inputTitle);

    const inputDesc = document.createElement('input');
    inputDesc.type = 'hidden';
    inputDesc.name = 'project[description]';
    inputDesc.value = 'Layout generated with Grid Master';
    form.appendChild(inputDesc);

    const inputTemplate = document.createElement('input');
    inputTemplate.type = 'hidden';
    inputTemplate.name = 'project[template]';
    inputTemplate.value = 'html';
    form.appendChild(inputTemplate);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}

export function downloadProjectHtml(state: GridState) {
    const html = generateHTML(state);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grid-master-project.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function generateSVG(state: GridState, theme = 'standard'): string {
    const width = 800;
    const height = 600;

    const parseTrack = (track: string, available: number) => {
        if (track.endsWith('px')) return parseFloat(track);
        if (track.endsWith('%')) return (parseFloat(track) / 100) * available;
        if (track === 'auto' || track.includes('minmax') || track.includes('fit-content')) return 100; // arbitrary fallback
        if (track.endsWith('fr')) return parseFloat(track);
        return 100;
    };

    const rowDefs = state.rows.map(r => ({ raw: r, val: parseTrack(r, height), type: r.endsWith('fr') ? 'fr' : 'fixed' }));
    const colDefs = state.cols.map(c => ({ raw: c, val: parseTrack(c, width), type: c.endsWith('fr') ? 'fr' : 'fixed' }));

    const totalFixedH = rowDefs.filter(r => r.type === 'fixed').reduce((a, b) => a + b.val, 0);
    const totalFrH = rowDefs.filter(r => r.type === 'fr').reduce((a, b) => a + b.val, 0);
    const availableH = Math.max(0, height - totalFixedH);

    const totalFixedW = colDefs.filter(c => c.type === 'fixed').reduce((a, b) => a + b.val, 0);
    const totalFrW = colDefs.filter(c => c.type === 'fr').reduce((a, b) => a + b.val, 0);
    const availableW = Math.max(0, width - totalFixedW);

    // Calculate start positions
    const rowPos = [0];
    rowDefs.forEach(r => {
        let size = r.val;
        if (r.type === 'fr') {
            size = (r.val / (totalFrH || 1)) * availableH;
        }
        rowPos.push(rowPos[rowPos.length - 1] + size);
    });

    const colPos = [0];
    colDefs.forEach(c => {
        let size = c.val;
        if (c.type === 'fr') {
            size = (c.val / (totalFrW || 1)) * availableW;
        }
        colPos.push(colPos[colPos.length - 1] + size);
    });

    // Generate Areas
    let rects = '';
    const fontSize = 14;

    state.areas.forEach(area => {
        const r1 = area.rowStart - 1;
        const r2 = area.rowEnd - 1;
        const c1 = area.colStart - 1;
        const c2 = area.colEnd - 1;

        if (r1 >= rowPos.length || c1 >= colPos.length) return;

        const y = rowPos[r1];
        const h = Math.max(0, (rowPos[r2] || height) - y);
        const x = colPos[c1];
        const w = Math.max(0, (colPos[c2] || width) - x);

        // Apply theme colors
        let fill = area.color.startsWith('#') ? area.color : COLOR_MAP[area.color] || '#cbd5e1';
        let stroke = 'none';
        let textFill = '#1e293b'; // slate-800
        let strokeWidth = 0;

        if (theme === 'blueprint') {
            fill = '#1e3a8a'; // blue-900
            stroke = '#60a5fa'; // blue-400
            strokeWidth = 2;
            textFill = '#ffffff';
        } else if (theme === 'wireframe') {
            fill = '#ffffff';
            stroke = '#94a3b8'; // slate-400
            strokeWidth = 2;
            textFill = '#000000';
        } else if (theme === 'cyber') {
            fill = '#000000';
            stroke = '#00ff00';
            strokeWidth = 2;
            textFill = '#00ff00';
        }

        // Adjust opacity for fill in blueprint/wireframe
        const fillOpacity = theme === 'standard' ? 1 : (theme === 'blueprint' ? 0.5 : 0.1);

        rects += `
            <g>
                <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" fill-opacity="${fillOpacity}" stroke="${stroke}" stroke-width="${strokeWidth}" />
                <text x="${x + w/2}" y="${y + h/2}" font-family="sans-serif" font-size="${fontSize}" fill="${textFill}" text-anchor="middle" dominant-baseline="middle" font-weight="bold">
                    ${area.name}
                </text>
            </g>
        `;
    });

    const bg = theme === 'cyber' ? '#111' : (theme === 'blueprint' ? '#eff6ff' : '#f8fafc');

    return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${bg}" />
    ${rects}
</svg>
    `.trim();
}

export function downloadSVG(state: GridState, theme = 'standard') {
    const svg = generateSVG(state, theme);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grid-master-${theme}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
