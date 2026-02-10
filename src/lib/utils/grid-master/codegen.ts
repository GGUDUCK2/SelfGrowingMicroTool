import type { GridState, GridArea } from './types';
import { getPlaceholderContent } from './placeholders';
import { COLOR_MAP } from './constants';

// Helper to generate Tailwind classes for the grid container
function getContainerClasses(state: GridState): string {
    const { rows, cols, gap, rowGap, colGap, justifyItems, alignItems, justifyContent, alignContent, includeMobile } = state;
    const safeJoin = (arr: string[]) => arr.join('_');
    const prefix = includeMobile ? 'md:' : '';

    const colClass = `${prefix}grid-cols-[${safeJoin(cols)}]`;
    const rowClass = `${prefix}grid-rows-[${safeJoin(rows)}]`;

    let gapClass = `gap-[${gap}]`;
    if (rowGap !== gap || colGap !== gap) {
        gapClass = `gap-y-[${rowGap}] gap-x-[${colGap}]`;
    }

    const justifyItemsMap = { start: 'justify-items-start', end: 'justify-items-end', center: 'justify-items-center', stretch: 'justify-items-stretch' };
    const alignItemsMap = { start: 'items-start', end: 'items-end', center: 'items-center', stretch: 'items-stretch' };
    const justifyContentMap = { start: 'justify-start', end: 'justify-end', center: 'justify-center', stretch: 'justify-stretch', 'space-around': 'justify-around', 'space-between': 'justify-between', 'space-evenly': 'justify-evenly' };
    const alignContentMap = { start: 'content-start', end: 'content-end', center: 'content-center', stretch: 'content-stretch', 'space-around': 'content-around', 'space-between': 'content-between', 'space-evenly': 'content-evenly' };

    const alignClasses = [
        justifyItemsMap[justifyItems],
        alignItemsMap[alignItems],
        justifyContentMap[justifyContent],
        alignContentMap[alignContent]
    ].filter(Boolean).join(' ');

    const mobileBase = includeMobile ? 'grid-cols-1' : '';

    return `grid ${mobileBase} ${colClass} ${rowClass} ${gapClass} ${alignClasses} h-full w-full`;
}

// Helper to generate Tailwind classes for an item
function getItemClasses(area: GridArea, includeMobile: boolean, mobileStrategy?: 'stack' | 'hide-sidebar'): string {
    const prefix = includeMobile ? 'md:' : '';
    const rowSpan = area.rowEnd - area.rowStart;
    const colSpan = area.colEnd - area.colStart;

    let classes = `${prefix}row-start-${area.rowStart}`;
    if (rowSpan > 1) classes += ` ${prefix}row-span-${rowSpan}`;
    else classes += ` ${prefix}row-span-1`;

    classes += ` ${prefix}col-start-${area.colStart}`;
    if (colSpan > 1) classes += ` ${prefix}col-span-${colSpan}`;
    else classes += ` ${prefix}col-span-1`;

    // Map color to tailwind class if possible, or arbitrary
    const colorClass = area.color.startsWith('#') ? `bg-[${area.color}]` : `bg-${area.color}-100 text-${area.color}-900`;

    if (includeMobile && mobileStrategy === 'hide-sidebar') {
        const isSidebar = area.tag === 'aside' || area.name.includes('sidebar');
        if (isSidebar) {
            return `hidden md:block ${classes} ${colorClass} p-4 rounded`;
        }
    }

    return `${classes} ${colorClass} p-4 rounded`;
}

export function generateCSS(state: GridState, containerId = 'container'): string {
  const { rows, cols, gap, rowGap, colGap, areas, includeMobile } = state;
  const gridTemplateRows = rows.join(' ');
  const gridTemplateColumns = cols.join(' ');

  // Construct grid-template-areas
  const rowCount = rows.length;
  const colCount = cols.length;
  const gridMap: string[][] = Array(rowCount).fill(null).map(() => Array(colCount).fill('.'));

  areas.forEach(area => {
    // Grid lines are 1-based
    for (let r = area.rowStart - 1; r < area.rowEnd - 1; r++) {
      for (let c = area.colStart - 1; c < area.colEnd - 1; c++) {
        if (r >= 0 && r < rowCount && c >= 0 && c < colCount) {
          gridMap[r][c] = area.name;
        }
      }
    }
  });

  const templateAreas = gridMap.map(row => `    "${row.join(' ')}"`).join('\n');
  const hasDistinctGap = rowGap !== gap || colGap !== gap;

  let css = `.${containerId} {
  display: grid;
  grid-template-columns: ${gridTemplateColumns};
  grid-template-rows: ${gridTemplateRows};
  ${!hasDistinctGap ? `gap: ${gap};` : `row-gap: ${rowGap};\n  column-gap: ${colGap};`}
  justify-items: ${state.justifyItems};
  align-items: ${state.alignItems};
  justify-content: ${state.justifyContent};
  align-content: ${state.alignContent};
  grid-template-areas:
${templateAreas};
}
`;

  areas.forEach(area => {
    css += `\n.${area.name} {\n  grid-area: ${area.name};\n}`;
  });

  if (includeMobile) {
      css += generateMobileQuery(state, containerId);
  }

  return css;
}

export function generateMobileQuery(state: GridState, containerClass = 'container'): string {
    const { areas, mobileStrategy } = state;

    if (mobileStrategy === 'hide-sidebar') {
        const sidebars = areas.filter(a => a.tag === 'aside' || a.name.includes('sidebar'));
        const others = areas.filter(a => !sidebars.includes(a));

        const sorted = [...others].sort((a, b) => {
             if (a.mobileOrder !== undefined && b.mobileOrder !== undefined) {
                 return a.mobileOrder - b.mobileOrder;
             }
             if (a.rowStart !== b.rowStart) return a.rowStart - b.rowStart;
             return a.colStart - b.colStart;
        });
        const areasString = sorted.map(a => `    "${a.name}"`).join('\n');
        const hideCSS = sidebars.map(s => `\n  .${s.name} { display: none; }`).join('');

        return `
@media (max-width: 768px) {
  .${containerClass} {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    grid-template-areas:
${areasString};
  }${hideCSS}
}`;
    }

    const sorted = [...areas].sort((a, b) => {
        if (a.mobileOrder !== undefined && b.mobileOrder !== undefined) {
             return a.mobileOrder - b.mobileOrder;
        }
        if (a.rowStart !== b.rowStart) return a.rowStart - b.rowStart;
        return a.colStart - b.colStart;
    });

    const areasString = sorted.map(a => `    "${a.name}"`).join('\n');

    return `
@media (max-width: 768px) {
  .${containerClass} {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    grid-template-areas:
${areasString};
  }
}`;
}

export function generateTailwind(state: GridState): string {
    const containerClass = getContainerClasses(state);
    let html = `<div class="${containerClass}">\n`;

    state.areas.forEach(area => {
        const itemClass = getItemClasses(area, state.includeMobile, state.mobileStrategy);
        const tag = area.tag || 'div';
        html += `  <${tag} class="${itemClass}">\n    ${getPlaceholderContent(area)}\n  </${tag}>\n`;
    });

    html += `</div>`;
    return html;
}

export function generateTailwindConfig(state: GridState): string {
    const { rows, cols, areas, includeMobile, mobileStrategy } = state;

    // Helper to format array for JS object
    const formatArr = (arr: string[]) => `'${arr.join(' ')}'`;

    // Generate Areas for Desktop
    const rowCount = rows.length;
    const colCount = cols.length;
    const gridMap: string[][] = Array(rowCount).fill(null).map(() => Array(colCount).fill('.'));

    areas.forEach(area => {
        for (let r = area.rowStart - 1; r < area.rowEnd - 1; r++) {
            for (let c = area.colStart - 1; c < area.colEnd - 1; c++) {
                if (r >= 0 && r < rowCount && c >= 0 && c < colCount) {
                    gridMap[r][c] = area.name;
                }
            }
        }
    });

    const desktopAreas = gridMap.map(row => `          "${row.join(' ')}"`).join(',\n');

    let mobileAreas = '';
    if (includeMobile) {
        if (mobileStrategy === 'hide-sidebar') {
             const sidebars = areas.filter(a => a.tag === 'aside' || a.name.includes('sidebar'));
             const others = areas.filter(a => !sidebars.includes(a));
             const sorted = [...others].sort((a, b) => (a.mobileOrder ?? 0) - (b.mobileOrder ?? 0) || a.rowStart - b.rowStart);
             mobileAreas = sorted.map(a => `          "${a.name}"`).join(',\n');
        } else {
             const sorted = [...areas].sort((a, b) => (a.mobileOrder ?? 0) - (b.mobileOrder ?? 0) || a.rowStart - b.rowStart);
             mobileAreas = sorted.map(a => `          "${a.name}"`).join(',\n');
        }
    }

    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      gridTemplateColumns: {
        'layout': ${formatArr(cols)},
        ${includeMobile ? `'layout-mobile': '1fr',` : ''}
      },
      gridTemplateRows: {
        'layout': ${formatArr(rows)},
        ${includeMobile ? `'layout-mobile': 'auto',` : ''}
      },
      gridTemplateAreas: {
        'layout': [
${desktopAreas}
        ],
        ${includeMobile ? `'layout-mobile': [
${mobileAreas}
        ],` : ''}
      }
    }
  },
  plugins: [
    require('@savvywombat/tailwindcss-grid-areas')
  ]
};`;
}

export function generateReact(state: GridState): string {
    const containerClass = getContainerClasses(state);
    let jsx = `export default function GridLayout() {\n  return (\n    <div className="${containerClass}">\n`;

    state.areas.forEach(area => {
        const itemClass = getItemClasses(area, state.includeMobile, state.mobileStrategy);
        const tag = area.tag || 'div';
        // Replace class=" with className=" in placeholder content for React
        const content = getPlaceholderContent(area).replace(/class="/g, 'className="');
        jsx += `      <${tag} className="${itemClass}">\n        ${content}\n      </${tag}>\n`;
    });

    jsx += `    </div>\n  );\n}`;
    return jsx;
}

export function generateVue(state: GridState): string {
    const containerClass = getContainerClasses(state);
    let template = `<template>\n  <div class="${containerClass}">\n`;

    state.areas.forEach(area => {
        const itemClass = getItemClasses(area, state.includeMobile, state.mobileStrategy);
        const tag = area.tag || 'div';
        template += `    <${tag} class="${itemClass}">\n      ${getPlaceholderContent(area)}\n    </${tag}>\n`;
    });

    template += `  </div>\n</template>\n\n<script setup>\n// Vue 3 Composition API\n</script>`;
    return template;
}

export function generateSvelte(state: GridState): string {
    const containerClass = getContainerClasses(state);
    let markup = `<div class="${containerClass}">\n`;

    state.areas.forEach(area => {
        const itemClass = getItemClasses(area, state.includeMobile, state.mobileStrategy);
        const tag = area.tag || 'div';
        markup += `  <${tag} class="${itemClass}">\n    ${getPlaceholderContent(area)}\n  </${tag}>\n`;
    });

    markup += `</div>`;
    return markup;
}

export function generateHTML(state: GridState, theme = 'standard'): string {
    const css = generateCSS(state, 'grid-container');
    const { areas } = state;

    let bodyBg = '#f8fafc'; // standard
    let textColor = '#1e293b'; // slate-800

    if (theme === 'cyber') {
        bodyBg = '#000000';
        textColor = '#00ff00';
    } else if (theme === 'blueprint') {
        bodyBg = '#eff6ff'; // blue-50
        textColor = '#1e3a8a'; // blue-900
    } else if (theme === 'wireframe') {
        bodyBg = '#ffffff';
        textColor = '#000000';
    }

    // Generate visualization styles based on theme
    const visualStyles = areas.map(a => {
        let bg = a.color.startsWith('#') ? a.color : COLOR_MAP[a.color] || '#cbd5e1';
        let color = '#1e293b';
        let border = 'none';
        let shadow = 'none';

        if (theme === 'cyber') {
            bg = '#000000';
            color = '#00ff00';
            border = '1px solid #00ff00';
            shadow = '0 0 5px #00ff00';
        } else if (theme === 'blueprint') {
            bg = '#1e3a8a10';
            color = '#1e3a8a';
            border = '2px dashed #60a5fa';
        } else if (theme === 'wireframe') {
            bg = '#ffffff';
            color = '#000000';
            border = '2px solid #94a3b8';
        }

        return `.${a.name} {
            background-color: ${bg};
            color: ${color};
            border: ${border};
            box-shadow: ${shadow};
            padding: 1rem;
            border-radius: 0.25rem;
            overflow: hidden;
        }`;
    }).join('\n    ');

    // Utility classes for placeholders (mimic Tailwind)
    const utilities = `
    .w-full { width: 100%; }
    .h-full { height: 100%; }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .gap-2 { gap: 0.5rem; }
    .gap-4 { gap: 1rem; }
    .p-2 { padding: 0.5rem; }
    .p-3 { padding: 0.75rem; }
    .p-4 { padding: 1rem; }
    .rounded { border-radius: 0.25rem; }
    .rounded-lg { border-radius: 0.5rem; }
    .bg-current { background-color: currentColor; }
    .opacity-10 { opacity: 0.1; }
    .opacity-20 { opacity: 0.2; }
    .opacity-30 { opacity: 0.3; }
    .opacity-50 { opacity: 0.5; }
    .opacity-60 { opacity: 0.6; }
    .opacity-80 { opacity: 0.8; }
    .text-xs { font-size: 0.75rem; }
    .text-sm { font-size: 0.875rem; }
    .text-lg { font-size: 1.125rem; }
    .text-2xl { font-size: 1.5rem; }
    .font-bold { font-weight: 700; }
    .font-black { font-weight: 900; }
    .border { border-width: 1px; border-style: solid; border-color: currentColor; }
    .border-2 { border-width: 2px; }
    .mb-1 { margin-bottom: 0.25rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .relative { position: relative; }
    .absolute { position: absolute; }
    .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
    .overflow-hidden { overflow: hidden; }
    `;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Grid Master Layout</title>
  <style>
    body {
        margin: 0;
        font-family: system-ui, -apple-system, sans-serif;
        padding: 2rem;
        background: ${bodyBg};
        color: ${textColor};
    }
    .grid-container {
      min-height: 80vh;
      background: ${theme === 'cyber' ? '#111' : (theme === 'wireframe' ? '#fff' : '#fff')};
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      border-radius: 0.5rem;
      padding: 1rem;
      ${theme === 'wireframe' ? 'border: 2px solid #000;' : ''}
    }
    ${css}
    /* Visualization Styles */
    ${visualStyles}
    /* Mock Content Utilities */
    ${utilities}
  </style>
</head>
<body>
  <div class="grid-container">
    ${areas.map(a => `<${a.tag || 'div'} class="${a.name}">${getPlaceholderContent(a)}</${a.tag || 'div'}>`).join('\n    ')}
  </div>
</body>
</html>`;
}
