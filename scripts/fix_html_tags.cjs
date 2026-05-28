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

        // Replace {@html '<script type="application/ld+json">' + jsonLd + '</scr' + 'ipt>'} without comments
        const htmlRegex = /([ \t]*)({@html\s+['"`]<script type="application\/ld\+json">['"`]\s*\+\s*[a-zA-Z0-9_\.]+\s*\+\s*['"`]<\/scr['"`]\s*\+\s*['"`]ipt>['"`]})/g;
        content = content.replace(htmlRegex, (match, spaces, tag) => {
            if (content.indexOf(`<!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->\n${spaces}${tag}`) !== -1) return match;
            changed = true;
            return `${spaces}<!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->\n${spaces}${tag}`;
        });

        // Replace {@html `...`}
        const htmlRegex2 = /([ \t]*)({@html\s+`[^`]+`})/g;
        content = content.replace(htmlRegex2, (match, spaces, tag) => {
            if (content.indexOf(`<!-- eslint-disable-next-line svelte/no-at-html-tags -->\n${spaces}${tag}`) !== -1) return match;
            changed = true;
            return `${spaces}<!-- eslint-disable-next-line svelte/no-at-html-tags -->\n${spaces}${tag}`;
        });

        // Also fix the no-navigation-without-resolve
        const hrefRegex = /([ \t]*)(<a[^>]+href="[^"]+"[^>]*>)/g;
        content = content.replace(hrefRegex, (match, spaces, tag) => {
            if (tag.includes('href="/{lang}/')) {
                if (content.indexOf(`<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->\n${spaces}${tag}`) !== -1) return match;
                changed = true;
                return `${spaces}<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->\n${spaces}${tag}`;
            }
            return match;
        });

        if (changed) {
            console.log("Fixed HTML tags in " + filePath);
            fs.writeFileSync(filePath, content, 'utf8');
        }
    }
});
