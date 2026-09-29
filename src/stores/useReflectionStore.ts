import { create } from 'zustand';
import { LocalReflection, LocalBookmark } from '../types/quran';
import { localDb } from '../db/indexedDB';
import { syncOfflineReflections } from '../lib/supabase';

interface ReflectionState {
  reflections: LocalReflection[];
  bookmarks: LocalBookmark[];
  isLoading: boolean;
  isSyncing: boolean;

  loadReflections: () => Promise<void>;
  addReflection: (surahId: number, reflectionText: string, actionItem?: string, verseRef?: string) => Promise<void>;
  deleteReflection: (id: string) => Promise<void>;
  toggleBookmark: (surahId: number, axisTag?: string, note?: string) => Promise<void>;
  isBookmarked: (surahId: number) => boolean;
  syncData: () => Promise<{ count: number; error?: string }>;
}

export const useReflectionStore = create<ReflectionState>((set, get) => ({
  reflections: [],
  bookmarks: [],
  isLoading: false,
  isSyncing: false,

  loadReflections: async () => {
    set({ isLoading: true });
    try {
      const refs = await localDb.reflections.orderBy('created_at').reverse().toArray();
      const bks = await localDb.bookmarks.toArray();
      set({ reflections: refs, bookmarks: bks });
    } catch (err) {
      console.error('Failed to load local reflections/bookmarks:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  addReflection: async (surahId, reflectionText, actionItem, verseRef) => {
    const newRef: LocalReflection = {
      id: crypto.randomUUID(),
      surah_id: surahId,
      verse_reference: verseRef || '',
      reflection_text: reflectionText,
      action_item: actionItem || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_synced: 0, // offline modified
    };

    try {
      await localDb.reflections.add(newRef);
      await get().loadReflections();

      // Trigger async sync in background if online
      if (navigator.onLine) {
        syncOfflineReflections().then(() => get().loadReflections()).catch(() => {});
      }
    } catch (err) {
      console.error('Failed to save reflection:', err);
    }
  },

  deleteReflection: async (id) => {
    try {
      await localDb.reflections.delete(id);
      await get().loadReflections();
    } catch (err) {
      console.error('Failed to delete reflection:', err);
    }
  },

  toggleBookmark: async (surahId, axisTag, note) => {
    const existing = get().bookmarks.find((b) => b.surah_id === surahId);
    try {
      if (existing) {
        await localDb.bookmarks.delete(existing.id);
      } else {
        const newBk: LocalBookmark = {
          id: crypto.randomUUID(),
          surah_id: surahId,
          axis_tag: axisTag,
          note: note,
          created_at: new Date().toISOString(),
        };
        await localDb.bookmarks.add(newBk);
      }
      await get().loadReflections();
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  },

  isBookmarked: (surahId) => {
    return get().bookmarks.some((b) => b.surah_id === surahId);
  },

  syncData: async () => {
    set({ isSyncing: true });
    try {
      const res = await syncOfflineReflections();
      await get().loadReflections();
      return { count: res.syncedCount, error: res.error };
    } finally {
      set({ isSyncing: false });
    }
  },
}));
