const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/lib/registry.json', 'utf8'));
const latest = data.reduce((max, tool) => {
  return new Date(tool.createdAt) > new Date(max.createdAt) ? tool : max;
}, data[0]);
console.log(JSON.stringify(latest, null, 2));
