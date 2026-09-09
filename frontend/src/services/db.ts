import type { Hymn, FavoriteItem, HistoryItem, HymnList } from '../types/hymn';

const DB_NAME = 'cantor_cristao_db';
const DB_VERSION = 1;

class HymnDatabase {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB não suportado neste navegador'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('hymns')) {
          const hymnStore = db.createObjectStore('hymns', { keyPath: 'id' });
          hymnStore.createIndex('number', 'number', { unique: true });
          hymnStore.createIndex('category', 'category', { unique: false });
        }

        if (!db.objectStoreNames.contains('favorites')) {
          const favStore = db.createObjectStore('favorites', { keyPath: 'id' });
          favStore.createIndex('savedAt', 'savedAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('history')) {
          const histStore = db.createObjectStore('history', { keyPath: 'id' });
          histStore.createIndex('viewedAt', 'viewedAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('lists')) {
          db.createObjectStore('lists', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.initPromise;
  }

  // --- HYMNS ---
  async getHymnById(id: number): Promise<Hymn | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('hymns', 'readonly');
        const store = tx.objectStore('hymns');
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  }

  async getAllHymns(): Promise<Hymn[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('hymns', 'readonly');
        const store = tx.objectStore('hymns');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return [];
    }
  }

  async saveHymns(hymns: Hymn[]): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('hymns', 'readwrite');
        const store = tx.objectStore('hymns');
        for (const hymn of hymns) {
          store.put(hymn);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('Erro ao salvar hinos no IndexedDB:', err);
    }
  }

  async countHymns(): Promise<number> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('hymns', 'readonly');
        const store = tx.objectStore('hymns');
        const req = store.count();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return 0;
    }
  }

  // --- FAVORITES ---
  async getFavorites(): Promise<FavoriteItem[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('favorites', 'readonly');
        const store = tx.objectStore('favorites');
        const req = store.getAll();
        req.onsuccess = () => {
          const items: FavoriteItem[] = req.result || [];
          items.sort((a, b) => b.savedAt - a.savedAt);
          resolve(items);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      const local = localStorage.getItem('cc_favorites');
      return local ? JSON.parse(local) : [];
    }
  }

  async addFavorite(item: FavoriteItem): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('favorites', 'readwrite');
      tx.objectStore('favorites').put(item);
    } catch {
      const favs = await this.getFavorites();
      const updated = [item, ...favs.filter((f) => f.id !== item.id)];
      localStorage.setItem('cc_favorites', JSON.stringify(updated));
    }
  }

  async removeFavorite(id: number): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('favorites', 'readwrite');
      tx.objectStore('favorites').delete(id);
    } catch {
      const favs = await this.getFavorites();
      const updated = favs.filter((f) => f.id !== id);
      localStorage.setItem('cc_favorites', JSON.stringify(updated));
    }
  }

  async isFavorite(id: number): Promise<boolean> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('favorites', 'readonly');
        const store = tx.objectStore('favorites');
        const req = store.get(id);
        req.onsuccess = () => resolve(!!req.result);
        req.onerror = () => resolve(false);
      });
    } catch {
      const favs = await this.getFavorites();
      return favs.some((f) => f.id === id);
    }
  }

  // --- HISTORY ---
  async getHistory(): Promise<HistoryItem[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('history', 'readonly');
        const store = tx.objectStore('history');
        const req = store.getAll();
        req.onsuccess = () => {
          const items: HistoryItem[] = req.result || [];
          items.sort((a, b) => b.viewedAt - a.viewedAt);
          resolve(items.slice(0, 30));
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      const local = localStorage.getItem('cc_history');
      return local ? JSON.parse(local) : [];
    }
  }

  async addHistory(item: HistoryItem): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('history', 'readwrite');
      tx.objectStore('history').put(item);
    } catch {
      const hist = await this.getHistory();
      const updated = [item, ...hist.filter((h) => h.id !== item.id)].slice(0, 30);
      localStorage.setItem('cc_history', JSON.stringify(updated));
    }
  }

  async clearHistory(): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('history', 'readwrite');
      tx.objectStore('history').clear();
    } catch {
      localStorage.removeItem('cc_history');
    }
  }

  // --- LISTS / ORDEM DE CULTO ---
  async getLists(): Promise<HymnList[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('lists', 'readonly');
        const store = tx.objectStore('lists');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      const local = localStorage.getItem('cc_lists');
      return local ? JSON.parse(local) : [];
    }
  }

  async saveList(list: HymnList): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('lists', 'readwrite');
      tx.objectStore('lists').put(list);
    } catch {
      const lists = await this.getLists();
      const idx = lists.findIndex((l) => l.id === list.id);
      if (idx >= 0) lists[idx] = list;
      else lists.push(list);
      localStorage.setItem('cc_lists', JSON.stringify(lists));
    }
  }

  async deleteList(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('lists', 'readwrite');
      tx.objectStore('lists').delete(id);
    } catch {
      const lists = await this.getLists();
      const updated = lists.filter((l) => l.id !== id);
      localStorage.setItem('cc_lists', JSON.stringify(updated));
    }
  }

  // --- SETTINGS ---
  async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('settings', 'readonly');
        const store = tx.objectStore('settings');
        const req = store.get(key);
        req.onsuccess = () => {
          if (req.result && req.result.value !== undefined) resolve(req.result.value as T);
          else resolve(defaultValue);
        };
        req.onerror = () => resolve(defaultValue);
      });
    } catch {
      const val = localStorage.getItem(`cc_setting_${key}`);
      return val !== null ? JSON.parse(val) : defaultValue;
    }
  }

  async setSetting<T>(key: string, value: T): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('settings', 'readwrite');
      tx.objectStore('settings').put({ key, value });
    } catch {
      localStorage.setItem(`cc_setting_${key}`, JSON.stringify(value));
    }
  }
}

export const dbService = new HymnDatabase();
