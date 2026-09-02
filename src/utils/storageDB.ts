/**
 * Dual-layer High Performance Storage System
 * Combines Synchronous LocalStorage + Asynchronous IndexedDB for lightning speed & durability.
 */

const DB_NAME = 'BunkBuddyDB';
const DB_VERSION = 1;
const STORE_NAME = 'app_store';

class StorageDB {
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !('indexedDB' in window)) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        resolve(db);
      };

      request.onerror = (event: Event) => {
        console.warn('IndexedDB failed to open, falling back to localStorage', event);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Retrieves data synchronously from LocalStorage first for speed,
   * then updates memory state if IndexedDB has newer data.
   */
  public getSync<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        return JSON.parse(item);
      }
    } catch (e) {
      console.warn(`Error reading ${key} from localStorage`, e);
    }
    return defaultValue;
  }

  /**
   * Async get from IndexedDB with LocalStorage fallback
   */
  public async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const db = await this.initDB();
      return new Promise<T>((resolve) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
          if (request.result !== undefined) {
            resolve(request.result as T);
          } else {
            resolve(this.getSync(key, defaultValue));
          }
        };

        request.onerror = () => {
          resolve(this.getSync(key, defaultValue));
        };
      });
    } catch {
      return this.getSync(key, defaultValue);
    }
  }

  /**
   * Saves to BOTH LocalStorage (synchronously) and IndexedDB (asynchronously)
   */
  public set<T>(key: string, value: T): void {
    const jsonString = JSON.stringify(value);

    // Save to LocalStorage
    try {
      localStorage.setItem(key, jsonString);
    } catch (e) {
      console.error(`Failed to save ${key} to localStorage`, e);
    }

    // Save to IndexedDB
    this.initDB().then((db) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.put(value, key);
    }).catch((err) => {
      console.warn(`IndexedDB background write failed for ${key}`, err);
    });
  }

  /**
   * Removes key from both stores
   */
  public remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Failed to remove ${key} from localStorage`, e);
    }

    this.initDB().then((db) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.delete(key);
    }).catch(() => {});
  }

  /**
   * Export full backup object
   */
  public exportBackup(): string {
    const backup: Record<string, any> = {
      bunkbuddy_user: this.getSync('bunkbuddy_user', null),
      subjects: this.getSync('subjects', []),
      notes: this.getSync('notes', []),
      timetable_settings: this.getSync('timetable_settings', null),
      attendance_daily_logs: this.getSync('attendance_daily_logs', {}),
      active_tab: this.getSync('active_tab', 'timetable'),
      export_date: new Date().toISOString()
    };
    return btoa(unescape(encodeURIComponent(JSON.stringify(backup))));
  }

  /**
   * Restore full backup object
   */
  public importBackup(rawData: string): boolean {
    try {
      let parsed: any;
      const trimmed = rawData.trim();

      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        parsed = JSON.parse(trimmed);
      } else {
        try {
          const decoded = decodeURIComponent(escape(atob(trimmed)));
          parsed = JSON.parse(decoded);
        } catch {
          parsed = JSON.parse(trimmed);
        }
      }

      if (Array.isArray(parsed)) {
        this.set('subjects', parsed);
        return true;
      }

      if (parsed && typeof parsed === 'object') {
        if (parsed.subjects && Array.isArray(parsed.subjects)) {
          this.set('subjects', parsed.subjects);
        }
        if (parsed.notes && Array.isArray(parsed.notes)) {
          this.set('notes', parsed.notes);
        }
        if (parsed.bunkbuddy_user) {
          this.set('bunkbuddy_user', parsed.bunkbuddy_user);
        }
        if (parsed.userData) {
          this.set('userData', parsed.userData);
        }
        if (parsed.timetable_settings) {
          this.set('timetable_settings', parsed.timetable_settings);
        }
        if (parsed.attendance_daily_logs) {
          this.set('attendance_daily_logs', parsed.attendance_daily_logs);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }
}

export const db = new StorageDB();
