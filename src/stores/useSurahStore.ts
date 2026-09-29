import { create } from 'zustand';
import { Surah, RevelationType } from '../types/quran';
import { ALL_SURAHS } from '../data/surahsData';
import { localDb } from '../db/indexedDB';

interface SurahState {
  surahs: Surah[];
  selectedSurahId: number;
  searchQuery: string;
  selectedJuz: number | null;
  selectedRevelation: RevelationType | 'الكل';
  quickWirdSurahId: number | null;
  isLoading: boolean;

  // Actions
  initializeData: () => Promise<void>;
  setSelectedSurahId: (id: number) => void;
  setSearchQuery: (query: string) => void;
  setSelectedJuz: (juz: number | null) => void;
  setSelectedRevelation: (type: RevelationType | 'الكل') => void;
  setQuickWirdSurahId: (id: number | null) => void;
  getFilteredSurahs: () => Surah[];
}

export const useSurahStore = create<SurahState>((set, get) => ({
  surahs: ALL_SURAHS,
  selectedSurahId: 1,
  searchQuery: '',
  selectedJuz: null,
  selectedRevelation: 'الكل',
  quickWirdSurahId: null,
  isLoading: false,

  initializeData: async () => {
    set({ isLoading: true });
    try {
      // Check if Dexie has cached surahs
      const count = await localDb.surahs.count();
      if (count === 0) {
        await localDb.surahs.bulkAdd(ALL_SURAHS);
      } else {
        const cached = await localDb.surahs.toArray();
        if (cached && cached.length > 0) {
          set({ surahs: cached });
        }
      }
    } catch (err) {
      console.warn('Dexie DB initialization fallback to static data:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedSurahId: (id) => set({ selectedSurahId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedJuz: (juz) => set({ selectedJuz: juz }),
  setSelectedRevelation: (type) => set({ selectedRevelation: type }),
  setQuickWirdSurahId: (id) => set({ quickWirdSurahId: id }),

  getFilteredSurahs: () => {
    const { surahs, searchQuery, selectedJuz, selectedRevelation } = get();
    return surahs.filter((s) => {
      const matchesSearch =
        !searchQuery ||
        s.name_ar.includes(searchQuery) ||
        s.id.toString() === searchQuery ||
        s.central_theme.includes(searchQuery) ||
        s.other_names.some((n) => n.includes(searchQuery));

      const matchesJuz = selectedJuz === null || s.juz_start === selectedJuz;
      const matchesRev = selectedRevelation === 'الكل' || s.revelation_type === selectedRevelation;

      return matchesSearch && matchesJuz && matchesRev;
    });
  },
}));
