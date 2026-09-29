import Dexie, { Table } from 'dexie';
import { Surah, LocalReflection, LocalBookmark } from '../types/quran';

export class AppDatabase extends Dexie {
  surahs!: Table<Surah, number>;
  reflections!: Table<LocalReflection, string>;
  bookmarks!: Table<LocalBookmark, string>;

  constructor() {
    super('QuranTadabburDB');
    this.version(1).stores({
      surahs: 'id, name_ar, revelation_type, juz_start',
      reflections: 'id, surah_id, is_synced, created_at',
      bookmarks: 'id, surah_id, created_at'
    });
  }
}

export const localDb = new AppDatabase();
