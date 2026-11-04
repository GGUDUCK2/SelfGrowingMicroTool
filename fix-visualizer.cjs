const fs = require('fs');

const filePath = 'src/routes/[lang]/tools/subnet-scope/Visualizer.svelte';
let content = fs.readFileSync(filePath, 'utf8');

// The original file used `flex flex-wrap`. By adding `overflow-x-auto block whitespace-nowrap`, we introduced conflicting display properties (`flex` vs `block`).
// The intended behavior for the visualizer is likely flex wrapping.
content = content.replace(
    'flex flex-wrap gap-y-2 font-mono text-sm md:text-base leading-relaxed overflow-x-auto block whitespace-nowrap max-w-full',
    'flex flex-wrap gap-y-2 font-mono text-sm md:text-base leading-relaxed max-w-full'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Updated ${filePath}`);
