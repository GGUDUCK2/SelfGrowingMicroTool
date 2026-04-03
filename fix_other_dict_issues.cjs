const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

const files = walk('src/routes/[lang]/tools');
const svelteFiles = files.filter(f => f.endsWith('.svelte'));

for (const file of svelteFiles) {
    let content = fs.readFileSync(file, 'utf8');

    // Some schemas might use dict.title or dict.description but not declare dict.
    // E.g. dict.something.
    if (content.includes('dict.') && !content.includes('let dict') && !content.includes('const dict')) {
        console.log("Fixing undefined dict in:", file);
        // Replace dict. with t. or dictionary. based on what's available
        if (content.includes('let t =') || content.includes('$: t =')) {
            content = content.replace(/dict\./g, 't.');
        } else {
            content = content.replace(/dict\./g, 'dictionary.');
        }
        fs.writeFileSync(file, content);
    }
}
console.log('Done fixing other dict references');
