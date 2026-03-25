type StorageType = 'local' | 'session';

class StorageUtil {
  private getStorage(type: StorageType) {
    return type === 'local' ? localStorage : sessionStorage;
  }

  get<T>(key: string, type: StorageType = 'local'): T | null {
    try {
      const item = this.getStorage(type).getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  set(key: string, value: unknown, type: StorageType = 'local'): void {
    try {
      this.getStorage(type).setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
    }
  }

  remove(key: string, type: StorageType = 'local'): void {
    this.getStorage(type).removeItem(key);
  }

  clear(type: StorageType = 'local'): void {
    this.getStorage(type).clear();
  }
}

export const storage = new StorageUtil();
