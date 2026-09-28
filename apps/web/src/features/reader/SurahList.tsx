import { useEffect, useState } from 'react';
import { db, SurahRecord } from '../../core/db';
import { ensureFixturePackLoaded } from '../packs/fixturePack';

interface Props {
  onSelectSurah: (surahId: number) => void;
}

export function SurahList({ onSelectSurah }: Props) {
  const [surahs, setSurahs] = useState<SurahRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      await ensureFixturePackLoaded();
      const list = await db.getSurahs();
      setSurahs(list);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredSurahs = surahs.filter(
    (s) =>
      s.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      s.nameAr.includes(search) ||
      s.id.toString() === search
  );

  if (loading) {
    return (
      <div className="p-8 text-center text-stone-500 animate-pulse">
        Loading Surah list from local pack...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search Surah by name or number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm"
        />
      </div>

      {/* Surah Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredSurahs.map((surah) => (
          <button
            key={surah.id}
            onClick={() => onSelectSurah(surah.id)}
            className="flex items-center justify-between p-4 rounded-xl border border-stone-200 bg-white hover:border-amber-600/50 hover:bg-amber-50/30 transition-all text-left group"
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 rounded-lg bg-stone-100 group-hover:bg-amber-100 text-stone-700 group-hover:text-amber-900 font-semibold text-sm flex items-center justify-center transition-colors">
                {surah.id}
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 group-hover:text-amber-950 transition-colors">
                  {surah.nameEn}
                </h3>
                <p className="text-xs text-stone-500 capitalize">
                  {surah.revelationType} &bull; {surah.verseCount} verses
                </p>
              </div>
            </div>
            <span className="font-serif text-xl font-bold text-amber-900 text-right" dir="rtl" lang="ar">
              {surah.nameAr}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
