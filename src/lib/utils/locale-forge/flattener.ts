export function flatten(obj: any, prefix = '', res: Record<string, string> = {}): Record<string, string> {
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      flatten(obj[key], prefix + key + '.', res);
    } else {
      // Handle arrays or primitives as leaves
      res[prefix + key] = obj[key];
    }
  }
  return res;
}

export function unflatten(obj: Record<string, any>): any {
  const result: any = {};
  for (const key in obj) {
    const keys = key.split('.');
    let current = result;
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (i === keys.length - 1) {
        current[k] = obj[key];
      } else {
        current[k] = current[k] || {};
        current = current[k];
      }
    }
  }
  return result;
}
