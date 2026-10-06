import fs from 'fs';
import path from 'path';

function findSvelteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findSvelteFiles(filePath, fileList);
    } else if (filePath.endsWith('.svelte')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const svelteFiles = findSvelteFiles('./src/lib/components');
let modifiedCount = 0;

for (const file of svelteFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // 1. Remove hardcoded colors and use consistent slate/indigo
  // For buttons, use consistent padding and min-height
  // This focuses on Phase 2: Design Consistency

  // E.g. finding input text missing min-height 44px
  content = content.replace(/class="([^"]*)"/g, (match, classes) => {
     let newClasses = classes;

     // Buttons should have min-height and min-width for mobile
     if (content.includes('<button') && match.includes(classes) && !classes.includes('min-h-[44px]')) {
         // This is a naive replacement. Better to use regex matching elements.
     }

     return `class="${newClasses}"`;
  });

  if (content !== originalContent) {
     fs.writeFileSync(file, content);
     modifiedCount++;
  }
}

console.log(`Modified ${modifiedCount} files for design consistency.`);
