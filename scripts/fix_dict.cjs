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

        const guideRegex = /<GuideSection dict={([^}]+)} \/>/g;
        content = content.replace(guideRegex, (match, dictVar) => {
            changed = true;
            if (dictVar.includes('.guide')) {
                return '<GuideSection {...' + dictVar + '} />';
            } else {
                return '<GuideSection {...' + dictVar + '?.guide} />';
            }
        });

        const faqRegex = /<FAQSection dict={([^}]+)} \/>/g;
        content = content.replace(faqRegex, (match, dictVar) => {
             changed = true;
             return '<FAQSection\n      title={' + dictVar + '?.faqTitle}\n      items={[\n        { q: ' + dictVar + '?.q1, a: ' + dictVar + '?.a1 },\n        { q: ' + dictVar + '?.q2, a: ' + dictVar + '?.a2 },\n        { q: ' + dictVar + '?.q3, a: ' + dictVar + '?.a3 }\n      ]}\n    />';
        });

        if (changed) {
            console.log("Fixed " + filePath);
            fs.writeFileSync(filePath, content, 'utf8');
        }
    }
});
