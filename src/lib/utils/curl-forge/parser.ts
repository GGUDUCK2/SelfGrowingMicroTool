export interface RequestData {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
}

export function parseCurl(curlString: string): RequestData {
  const result: RequestData = { method: 'GET', url: '', headers: {}, body: '' };

  if (!curlString || typeof curlString !== 'string') return result;

  // Basic regex to find parts
  const args = curlString.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g);
  if (!args) return result;

  let hasMethodSet = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i].replace(/^['"]|['"]$/g, '');

    if (arg.toLowerCase() === 'curl') continue;

    if (arg === '-X' || arg === '--request') {
      result.method = (args[++i] || "").replace(/^['"]|['"]$/g, '').toUpperCase();
      hasMethodSet = true;
    } else if (arg === '-H' || arg === '--header') {
      const headerStr = (args[++i] || "").replace(/^['"]|['"]$/g, '');
      const colonIdx = headerStr.indexOf(':');
      if (colonIdx > 0) {
        const key = headerStr.substring(0, colonIdx).trim();
        const value = headerStr.substring(colonIdx + 1).trim();
        result.headers[key] = value;
      }
    } else if (arg === '-d' || arg === '--data' || arg === '--data-raw' || arg === '--data-binary') {
      result.body = (args[++i] || "").replace(/^['"]|['"]$/g, '');
      if (!hasMethodSet) result.method = 'POST';
    } else if (arg === '-b' || arg === '--cookie') {
        const cookieStr = (args[++i] || "").replace(/^['"]|['"]$/g, '');
        result.headers['Cookie'] = cookieStr;
    } else if (arg === '-A' || arg === '--user-agent') {
        const uaStr = (args[++i] || "").replace(/^['"]|['"]$/g, '');
        result.headers['User-Agent'] = uaStr;
    } else if (arg.startsWith('-')) {
        // Skip other flags
    } else if (arg.startsWith('http')) {
      result.url = arg;
    }
  }

  return result;
}

export function generateCurl(data: RequestData): string {
  let cmd = `curl -X ${data.method} "${data.url}"`;

  Object.entries(data.headers).forEach(([k, v]) => {
    if (k && v) {
      cmd += ` \\\n  -H "${k}: ${v}"`;
    }
  });

  if (data.body && (data.method === 'POST' || data.method === 'PUT' || data.method === 'PATCH')) {
    cmd += ` \\\n  -d '${data.body.replace(/'/g, "'\\''")}'`;
  }

  return cmd;
}

export function generateFetch(data: RequestData): string {
  const options: any = {
    method: data.method,
  };

  if (Object.keys(data.headers).length > 0) {
    options.headers = data.headers;
  }

  if (data.body && (data.method === 'POST' || data.method === 'PUT' || data.method === 'PATCH')) {
    options.body = data.body;
  }

  return `fetch("${data.url}", ${JSON.stringify(options, null, 2)});`;
}

export function generatePython(data: RequestData): string {
  let py = `import requests\n\nurl = "${data.url}"\n`;

  if (Object.keys(data.headers).length > 0) {
    py += `headers = ${JSON.stringify(data.headers, null, 4)}\n`;
  }

  if (data.body && (data.method === 'POST' || data.method === 'PUT' || data.method === 'PATCH')) {
    py += `data = '''${data.body}'''\n`;
  }

  py += `\nresponse = requests.${data.method.toLowerCase()}(url`;
  if (Object.keys(data.headers).length > 0) py += `, headers=headers`;
  if (data.body && (data.method === 'POST' || data.method === 'PUT' || data.method === 'PATCH')) py += `, data=data`;
  py += `)\n\nprint(response.text)`;

  return py;
}

export function generateAxios(data: RequestData): string {
  let ax = `const axios = require('axios');\n\n`;

  const options: any = {
    method: data.method.toLowerCase(),
    maxBodyLength: Infinity,
    url: data.url,
    headers: data.headers
  };

  if (data.body && (data.method === 'POST' || data.method === 'PUT' || data.method === 'PATCH')) {
    options.data = data.body; // In real life might need to be parsed if JSON
  }

  ax += `let config = ${JSON.stringify(options, null, 2)};\n\n`;
  ax += `axios.request(config)\n.then((response) => {\n  console.log(JSON.stringify(response.data));\n})\n.catch((error) => {\n  console.log(error);\n});`;

  return ax;
}
