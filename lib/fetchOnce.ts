const cache = new Map<string, Promise<unknown>>();

export function fetchOnce<T>(key: string, fn: () => Promise<T>): Promise<T> {
  if (!cache.has(key)) {
    cache.set(key, fn());
  }
  return cache.get(key) as Promise<T>;
}

export function invalidateFetch(key: string): void {
  cache.delete(key);
}
