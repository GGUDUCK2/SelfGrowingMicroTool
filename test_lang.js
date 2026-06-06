import fs from 'fs';
import path from 'path';

const toolsDir = 'src/routes/[lang]/tools';
const tools = fs.readdirSync(toolsDir).filter(f => fs.statSync(path.join(toolsDir, f)).isDirectory());

for (const tool of tools) {
  const pagePath = path.join(toolsDir, tool, '+page.svelte');
  if (fs.existsSync(pagePath)) {
    let content = fs.readFileSync(pagePath, 'utf-8');

    // verify lang variable is defined
    if (!content.includes('$: lang =') && !content.includes('export let lang') && !content.includes('let lang')) {
       console.log(`Missing lang in ${tool}`);
    }
  }
}
