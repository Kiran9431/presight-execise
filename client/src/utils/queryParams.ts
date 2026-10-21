export function getArrayParam(params: URLSearchParams, key: string): string[] {
  const value = params.get(key);
  if (!value) return [];
  return value.split(',').map(v => v.trim()).filter(v => v.length > 0);
}

export function setArrayParam(params: URLSearchParams, key: string, values: string[]): void {
  if (values.length > 0) {
    params.set(key, values.join(','));
  } else {
    params.delete(key);
  }
}
