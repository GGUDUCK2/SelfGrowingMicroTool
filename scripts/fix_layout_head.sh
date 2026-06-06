#!/bin/bash
find src/routes/ -name "+page.svelte" -print0 | xargs -0 grep -l "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-20" > fix_spacing2.txt
while IFS= read -r file; do
  sed -i 's/max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-20/max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12/g' "$file"
done < fix_spacing2.txt
