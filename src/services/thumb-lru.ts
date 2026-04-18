/**
 * LRU cache for in-memory thumbnail object URLs.
 * Uses Map iteration order (insertion-ordered) for O(1) LRU semantics.
 * Automatically revokes evicted object URLs.
 */
export class ThumbLRU {
  private cache = new Map<string, string>();

  constructor(private maxSize: number = 100) {}

  get(key: string): string | undefined {
    const url = this.cache.get(key);
    if (url === undefined) return undefined;
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, url);
    return url;
  }

  set(key: string, objectUrl: string): void {
    // If already exists, remove first
    if (this.cache.has(key)) {
      const old = this.cache.get(key)!;
      this.cache.delete(key);
      URL.revokeObjectURL(old);
    }
    // Evict if at capacity
    while (this.cache.size >= this.maxSize) {
      const oldest = this.cache.keys().next().value;
      if (oldest !== undefined) {
        const url = this.cache.get(oldest)!;
        this.cache.delete(oldest);
        URL.revokeObjectURL(url);
      }
    }
    this.cache.set(key, objectUrl);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    for (const url of this.cache.values()) {
      URL.revokeObjectURL(url);
    }
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

// Global singleton
export const thumbLRU = new ThumbLRU(100);
