/**
 * Generic concurrency-limited task queue.
 * Used to limit simultaneous thumbnail generation.
 */
export class ConcurrencyQueue {
  private running = 0;
  private queue: Array<() => void> = [];

  constructor(private concurrency: number) {}

  async add<T>(task: () => Promise<T>): Promise<T> {
    if (this.running >= this.concurrency) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }
    this.running++;
    try {
      return await task();
    } finally {
      this.running--;
      const next = this.queue.shift();
      if (next) next();
    }
  }
}
