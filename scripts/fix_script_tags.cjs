const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('src/routes/[lang]/tools', function(filePath) {
    if (filePath.endsWith('.svelte')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;

        // Replace </' + 'script> with </scr' + 'ipt>
        const scriptRegex = /<\/' \+ 'script>/g;
        if (scriptRegex.test(content)) {
            changed = true;
            content = content.replace(scriptRegex, `</scr' + 'ipt>`);
        }

        if (changed) {
            console.log("Fixed script tags in " + filePath);
            fs.writeFileSync(filePath, content, 'utf8');
        }
    }
});
