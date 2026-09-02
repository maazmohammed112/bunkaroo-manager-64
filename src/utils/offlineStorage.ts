/**
 * Utility functions for offline storage and data synchronization backed by dual IndexedDB + LocalStorage
 */
import { db } from './storageDB';

export const safelyStoreData = (key: string, data: any): boolean => {
  try {
    db.set(key, data);
    return true;
  } catch (error) {
    console.error(`Error storing ${key}:`, error);
    return false;
  }
};

export const safelyRetrieveData = <T>(key: string, defaultValue: T): T => {
  try {
    return db.getSync(key, defaultValue);
  } catch (error) {
    console.error(`Error retrieving ${key}:`, error);
    return defaultValue;
  }
};

export const isLocalStorageSupported = (): boolean => {
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

export const getRemainingStorageSpace = (): number => {
  try {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        total += key.length + value.length;
      }
    }
    const estimatedAvailable = 5242880 - total;
    return estimatedAvailable > 0 ? estimatedAvailable : 0;
  } catch (e) {
    return -1;
  }
};

export const clearOldData = (preserveKeys: string[] = []): boolean => {
  try {
    const essentialKeys = ['bunkbuddy_user', 'bunkbuddy_session', 'subjects', 'notes'];
    const keysToPreserve = [...new Set([...essentialKeys, ...preserveKeys])];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !keysToPreserve.includes(key)) {
        db.remove(key);
      }
    }
    return true;
  } catch (e) {
    console.error('Error clearing old data', e);
    return false;
  }
};