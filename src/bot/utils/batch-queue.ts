export class BatchQueue<T> {
  private items: T[] = [];

  private loading: Promise<T[]> | null = null;

  constructor(private readonly load: () => Promise<T[]>) {}

  async take() {
    while (!this.items.length) {
      this.items = await (this.loading ??= this.load().finally(() => (this.loading = null)));
    }

    return this.items.shift()!;
  }
}
