import fs from 'fs';
const registry = JSON.parse(fs.readFileSync('src/lib/registry.json', 'utf8'));
const latest = registry.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
console.log(latest);
