import { substituteVariables as sub } from './variable-subst';

export interface HttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string; // Text representation
  blob: Blob;   // Raw data
  time: number; // ms
  size: number; // bytes
  ok: boolean;
}

export async function executeRequest(
  method: string,
  url: string,
  headers: { key: string; value: string; enabled: boolean }[],
  bodyType: 'none' | 'json' | 'text' | 'form-data',
  bodyContent: string
): Promise<HttpResponse> {

  const start = performance.now();

  const finalHeaders: Record<string, string> = {};
  headers.forEach(h => {
    if (h.enabled && h.key) finalHeaders[h.key] = h.value;
  });

  const options: RequestInit = {
    method,
    headers: finalHeaders,
  };

  if (method !== 'GET' && method !== 'HEAD') {
    if (bodyType === 'json') {
      options.body = bodyContent;
      if (!finalHeaders['Content-Type']) {
        options.headers = { ...options.headers, 'Content-Type': 'application/json' };
      }
    } else if (bodyType === 'text') {
      options.body = bodyContent;
      if (!finalHeaders['Content-Type']) {
        options.headers = { ...options.headers, 'Content-Type': 'text/plain' };
      }
    } else if (bodyType === 'form-data') {
       options.body = bodyContent;
    }
  }

  try {
    const res = await fetch(url, options);
    const end = performance.now();
    const time = Math.round(end - start);


    const blob = await res.blob();
    const text = await blob.text();
    const size = blob.size;

    const resHeaders: Record<string, string> = {};
    res.headers.forEach((v, k) => resHeaders[k] = v);

    return {
      status: res.status,
      statusText: res.statusText,
      headers: resHeaders,
      body: text,
      blob,
      time,
      size,
      ok: res.ok
    };
  } catch (err: any) {
    console.error('Fetch error:', err);
    const end = performance.now();
    return {
      status: 0,
      statusText: 'Error',
      headers: {},
      body: err.message || 'Network Error (CORS or Offline?)',
      blob: new Blob(),
      time: Math.round(end - start),
      size: 0,
      ok: false
    };
  }
}

export { substituteVariables as sub } from './variable-subst';
export { substituteVariables } from './variable-subst';
