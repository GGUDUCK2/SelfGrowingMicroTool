import type { RestroRequest } from '$lib/db/restro';

export function generateCurl(req: RestroRequest): string {
  let cmd = `curl -X ${req.method} "${req.url}"`;

  req.headers.forEach(h => {
    if (h.enabled && h.key) {
      cmd += ` \\\n  -H "${h.key}: ${h.value}"`;
    }
  });

  if (req.method !== 'GET' && req.method !== 'HEAD' && req.bodyType !== 'none' && req.bodyContent) {
    // Escape single quotes for shell
    const cleanBody = req.bodyContent.replace(/'/g, "'\\''");
    cmd += ` \\\n  -d '${cleanBody}'`;
  }

  return cmd;
}

export function generateFetch(req: RestroRequest): string {
  const headersObj: Record<string, string> = {};
  req.headers.forEach(h => {
    if (h.enabled && h.key) headersObj[h.key] = h.value;
  });

  const options: any = {
    method: req.method,
    headers: headersObj
  };

  if (req.method !== 'GET' && req.method !== 'HEAD' && req.bodyType !== 'none' && req.bodyContent) {
    try {
        if (req.bodyType === 'json') {
             options.body = JSON.parse(req.bodyContent);
             // We'll stringify in the output
        } else {
             options.body = req.bodyContent;
        }
    } catch {
        options.body = req.bodyContent;
    }
  }

  // Formatting the body property logic for the snippet
  let bodyStr = '';
  if (options.body) {
    if (req.bodyType === 'json') {
        bodyStr = `\n  body: JSON.stringify(${JSON.stringify(options.body, null, 2).replace(/\n/g, '\n  ')})`;
    } else {
        bodyStr = `\n  body: \`${options.body}\``;
    }
  }

  const headersStr = JSON.stringify(options.headers, null, 2);

  return `fetch("${req.url}", {
  method: "${req.method}",
  headers: ${headersStr},${bodyStr}
});`;
}

export function generateMarkdownDocs(req: RestroRequest): string {
  const method = req.method.toUpperCase();
  const url = req.url;

  let md = `### ${method} ${url}\n\n`;

  if (req.headers && req.headers.some(h => h.enabled)) {
      md += `**Headers**\n\n| Key | Value |\n|---|---|\n`;
      req.headers.forEach(h => {
          if (h.enabled) md += `| ${h.key} | ${h.value} |\n`;
      });
      md += `\n`;
  }

  if (req.params && req.params.some(p => p.enabled)) {
      md += `**Query Parameters**\n\n| Key | Value |\n|---|---|\n`;
      req.params.forEach(p => {
          if (p.enabled) md += `| ${p.key} | ${p.value} |\n`;
      });
      md += `\n`;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD' && req.bodyType !== 'none' && req.bodyContent) {
      const lang = req.bodyType === 'json' ? 'json' : 'text';
      md += `**Body** (${req.bodyType})\n\n\`\`\`${lang}\n${req.bodyContent}\n\`\`\`\n`;
  }

  return md;
}
