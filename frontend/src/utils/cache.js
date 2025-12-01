/**
 * IndexedDB Cache Layer for Clickalinks
 * Provides fast local caching for Firestore data to reduce queries and improve performance
 */

const DB_NAME = 'clickalinks-cache';
const DB_VERSION = 1;
const STORE_NAME = 'purchases';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

let dbInstance = null;

/**
 * Initialize IndexedDB
 */
const initDB = () => {
  return new Promise((resolve, reject) => {
    // Check if IndexedDB is available
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not available'));
      return;
    }

    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'squareNumber' });
        store.createIndex('pageNumber', 'pageNumber', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };
  });
};

/**
 * Get cached purchases for a page range
 */
export const getCachedPurchases = async (start, end) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('pageNumber');
    
    const pageNumber = Math.ceil(start / 200);
    const purchases = {};
    const now = Date.now();
    
    // Get all items for this page
    const range = IDBKeyRange.bound(start, end);
    const request = store.openCursor(range);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const data = cursor.value;
          // Check if cache is still valid
          if (data.cachedAt && (now - data.cachedAt) < CACHE_DURATION) {
            // Check expiration
            if (data.endDate) {
              const endDate = new Date(data.endDate).getTime();
              if (endDate > now) {
                purchases[data.squareNumber] = data;
              }
            } else {
              purchases[data.squareNumber] = data;
            }
          }
          cursor.continue();
        } else {
          resolve(purchases);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('Cache read error:', error);
    return {};
  }
};

/**
 * Cache purchases
 */
export const cachePurchases = async (purchases) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const now = Date.now();
    
    const putPromises = [];
    for (const squareNumber in purchases) {
      const purchase = {
        ...purchases[squareNumber],
        cachedAt: now
      };
      putPromises.push(store.put(purchase));
    }
    
    await Promise.all(putPromises);
  } catch (error) {
    console.warn('Cache write error:', error);
  }
};

/**
 * Clear expired cache entries
 */
export const clearExpiredCache = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.openCursor();
    const now = Date.now();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const data = cursor.value;
          // Remove if cache expired or ad expired
          const cacheExpired = data.cachedAt && (now - data.cachedAt) >= CACHE_DURATION;
          const adExpired = data.endDate && new Date(data.endDate).getTime() <= now;
          
          if (cacheExpired || adExpired) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('Cache cleanup error:', error);
  }
};

/**
 * Clear all cache
 */
export const clearAllCache = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    await store.clear();
    // Transaction completes automatically when all operations finish
  } catch (error) {
    console.warn('Cache clear error:', error);
  }
};

