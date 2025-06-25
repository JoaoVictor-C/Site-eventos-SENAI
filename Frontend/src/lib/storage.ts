/**
 * Storage utility functions for consistent local storage access
 */

export const enum StorageKey {
  TOKEN = 'auth_token',
  REFRESH_TOKEN = 'refresh_token',
  USER = 'auth_user',
}

class StorageService {
  get<T>(key: StorageKey): T | null {
    const item = localStorage.getItem(key);
    if (!item) return null;
    try {
      return JSON.parse(item);
    } catch {
      return item as unknown as T;
    }
  }

  set<T>(key: StorageKey, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  remove(key: StorageKey): void {
    localStorage.removeItem(key);
  }

  clearAuth(): void {
    this.remove(StorageKey.TOKEN);
    this.remove(StorageKey.REFRESH_TOKEN);
    this.remove(StorageKey.USER);
  }
}

export const storage = new StorageService();
