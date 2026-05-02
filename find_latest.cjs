const fs = require('fs');
const registry = JSON.parse(fs.readFileSync('src/lib/registry.json', 'utf8'));

let latestTool = null;
let latestDate = new Date(0);

if (registry.tools) {
    registry.tools.forEach(tool => {
        const date = new Date(tool.createdAt);
        if (date > latestDate) {
            latestDate = date;
            latestTool = tool;
        }
    });
} else if (Array.isArray(registry)) {
    registry.forEach(tool => {
        const date = new Date(tool.createdAt);
        if (date > latestDate) {
            latestDate = date;
            latestTool = tool;
        }
    });
}
console.log(JSON.stringify(latestTool, null, 2));
