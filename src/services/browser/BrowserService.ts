export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

export interface WindowAdapter {
  location: {
    href: string;
    origin: string;
    pathname: string;
    search: string;
    hash: string;
  };
  history: {
    pushState(data: any, title: string, url?: string): void;
    replaceState(data: any, title: string, url?: string): void;
    back(): void;
    forward(): void;
  };
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

class LocalStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Silent fail for storage quota exceeded
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Silent fail
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch {
      // Silent fail
    }
  }
}

class SessionStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      // Silent fail
    }
  }

  removeItem(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Silent fail
    }
  }

  clear(): void {
    try {
      sessionStorage.clear();
    } catch {
      // Silent fail
    }
  }
}

class WindowServiceAdapter implements WindowAdapter {
  get location() {
    return {
      href: window.location.href,
      origin: window.location.origin,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    };
  }

  get history() {
    return {
      pushState: (data: any, title: string, url?: string) => window.history.pushState(data, title, url),
      replaceState: (data: any, title: string, url?: string) => window.history.replaceState(data, title, url),
      back: () => window.history.back(),
      forward: () => window.history.forward(),
    };
  }

  addEventListener(type: string, listener: EventListener): void {
    window.addEventListener(type, listener);
  }

  removeEventListener(type: string, listener: EventListener): void {
    window.removeEventListener(type, listener);
  }
}

class BrowserService {
  public readonly localStorage: StorageAdapter;
  public readonly sessionStorage: StorageAdapter;
  public readonly window: WindowAdapter;

  constructor() {
    this.localStorage = new LocalStorageAdapter();
    this.sessionStorage = new SessionStorageAdapter();
    this.window = new WindowServiceAdapter();
  }

  // Utility methods for common operations
  parseJSON<T = any>(value: string | null): T | null {
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  stringifyJSON(value: any): string {
    try {
      return JSON.stringify(value);
    } catch {
      return '';
    }
  }

  getStoredObject<T = any>(key: string, storage: 'local' | 'session' = 'local'): T | null {
    const adapter = storage === 'local' ? this.localStorage : this.sessionStorage;
    const value = adapter.getItem(key);
    return this.parseJSON<T>(value);
  }

  setStoredObject(key: string, value: any, storage: 'local' | 'session' = 'local'): void {
    const adapter = storage === 'local' ? this.localStorage : this.sessionStorage;
    const stringified = this.stringifyJSON(value);
    adapter.setItem(key, stringified);
  }

  removeStoredObject(key: string, storage: 'local' | 'session' = 'local'): void {
    const adapter = storage === 'local' ? this.localStorage : this.sessionStorage;
    adapter.removeItem(key);
  }

  isLocalStorageAvailable(): boolean {
    try {
      const test = '__test__';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  isSessionStorageAvailable(): boolean {
    try {
      const test = '__test__';
      sessionStorage.setItem(test, 'test');
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}

export const browserService = new BrowserService();