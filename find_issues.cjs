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
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('${dict.') && !content.includes('let dict') && !content.includes('const dict')) {
        console.log("Undefined dict in:", file);
    }
}
