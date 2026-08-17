// Node 25 exposes an experimental, non-functional global `localStorage`
// (needs --localstorage-file). Replace it with a working in-memory mock so
// component/unit tests can exercise token persistence.
class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

const mockStorage = new MemoryStorage();

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: mockStorage,
});

Object.defineProperty(window, "localStorage", {
  configurable: true,
  value: mockStorage,
});
