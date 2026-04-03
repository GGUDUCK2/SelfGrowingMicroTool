const fs = require('fs');
const path = require('path');

const filesToFix = [
    'src/routes/[lang]/tools/qr-forge/+page.svelte',
    'src/lib/components/qr-forge/QRConfig.svelte',
    'src/lib/components/qr-forge/QRPreview.svelte',
    'src/lib/components/qr-forge/QRHistory.svelte'
];

for (const file of filesToFix) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');

    // Simple regex to add min-h-[44px] to buttons if they don't have it
    let changed = false;
    content = content.replace(/<button([^>]*)class="([^"]*)"/g, (match, beforeClass, classString) => {
        if (!classString.includes('min-h-[44px]')) {
            changed = true;
            return `<button${beforeClass}class="${classString} min-h-[44px] min-w-[44px]"`;
        }
        if (!classString.includes('min-w-[44px]')) {
             changed = true;
             return `<button${beforeClass}class="${classString} min-w-[44px]"`;
        }
        return match;
    });

    if (changed) {
        fs.writeFileSync(file, content);
        console.log(`Updated touch targets in ${file}`);
    }
}
