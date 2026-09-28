export interface SurahRecord {
  id: number;
  nameAr: string;
  nameEn: string;
  revelationType: 'makki' | 'madani';
  verseCount: number;
  textChecksum: string;
}

export interface ThematicBlockRecord {
  id: string;
  surahId: number;
  title: string;
  verseStart: number;
  verseEnd: number;
  summary: string;
}

export interface VerseRecord {
  ref: string; // e.g. "1:1"
  surahId: number;
  verseNumber: number;
  textUthmani: string;
  blockId: string | null;
  juz: number;
}

export interface PackStateRecord {
  packId: string;
  version: string;
  installedAt: string;
}

class LocalIndexedDB {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open('TadabburDB', 1);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('surahs')) {
          db.createObjectStore('surahs', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('blocks')) {
          const store = db.createObjectStore('blocks', { keyPath: 'id' });
          store.createIndex('surahId', 'surahId', { unique: false });
        }
        if (!db.objectStoreNames.contains('verses')) {
          const store = db.createObjectStore('verses', { keyPath: 'ref' });
          store.createIndex('surahId', 'surahId', { unique: false });
          store.createIndex('blockId', 'blockId', { unique: false });
        }
        if (!db.objectStoreNames.contains('packState')) {
          db.createObjectStore('packState', { keyPath: 'packId' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  async getSurahs(): Promise<SurahRecord[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('surahs', 'readonly');
      const store = tx.objectStore('surahs');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as SurahRecord[]);
      req.onerror = () => reject(req.error);
    });
  }

  async getSurah(id: number): Promise<SurahRecord | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('surahs', 'readonly');
      const store = tx.objectStore('surahs');
      const req = store.get(id);
      req.onsuccess = () => resolve((req.result as SurahRecord) || null);
      req.onerror = () => reject(req.error);
    });
  }

  async getBlocksForSurah(surahId: number): Promise<ThematicBlockRecord[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('blocks', 'readonly');
      const store = tx.objectStore('blocks');
      const index = store.index('surahId');
      const req = index.getAll(surahId);
      req.onsuccess = () => resolve(req.result as ThematicBlockRecord[]);
      req.onerror = () => reject(req.error);
    });
  }

  async getVersesForSurah(surahId: number): Promise<VerseRecord[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('verses', 'readonly');
      const store = tx.objectStore('verses');
      const index = store.index('surahId');
      const req = index.getAll(surahId);
      req.onsuccess = () => {
        const list = req.result as VerseRecord[];
        list.sort((a, b) => a.verseNumber - b.verseNumber);
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getPackState(packId: string): Promise<PackStateRecord | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('packState', 'readonly');
      const store = tx.objectStore('packState');
      const req = store.get(packId);
      req.onsuccess = () => resolve((req.result as PackStateRecord) || null);
      req.onerror = () => reject(req.error);
    });
  }

  async savePack(
    packId: string,
    version: string,
    surahs: SurahRecord[],
    blocks: ThematicBlockRecord[],
    verses: VerseRecord[]
  ): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['surahs', 'blocks', 'verses', 'packState'], 'readwrite');
      const surahStore = tx.objectStore('surahs');
      const blockStore = tx.objectStore('blocks');
      const verseStore = tx.objectStore('verses');
      const packStore = tx.objectStore('packState');

      for (const s of surahs) surahStore.put(s);
      for (const b of blocks) blockStore.put(b);
      for (const v of verses) verseStore.put(v);
      packStore.put({ packId, version, installedAt: new Date().toISOString() });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const db = new LocalIndexedDB();
