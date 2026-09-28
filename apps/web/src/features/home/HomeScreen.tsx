import { useState, useEffect } from 'react';
import { db, SurahRecord } from '../../core/db';

interface HomeScreenProps {
  onSelectSurah: (surahId: number) => void;
  onOpenActions: () => void;
  onOpenJournal: () => void;
}

export function HomeScreen({ onSelectSurah, onOpenActions }: HomeScreenProps) {
  const [surahs, setSurahs] = useState<SurahRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actions, setActions] = useState([
    { id: 'act-1', text: 'Verify one forwarded message', verseRef: 'Al-Hujurat 49:6', done: true },
    { id: 'act-2', text: "Reach out to someone you've drifted from", verseRef: 'Al-Hujurat 49:10', done: false },
    { id: 'act-3', text: 'Pray for a friend by name', verseRef: 'Al-Hashr 59:10', done: false },
  ]);

  useEffect(() => {
    let mounted = true;
    db.getSurahs().then((loaded) => {
      if (mounted) {
        if (loaded.length > 0) {
          setSurahs(loaded);
        } else {
          // Default initial fallback list if DB is not yet populated by packs
          const fallbackSurahs: SurahRecord[] = [
            { id: 1, nameAr: 'الفاتحة', nameEn: 'Al-Fatihah', revelationType: 'makki', verseCount: 7, textChecksum: '' },
            { id: 2, nameAr: 'البقرة', nameEn: 'Al-Baqarah', revelationType: 'madani', verseCount: 286, textChecksum: '' },
            { id: 36, nameAr: 'يس', nameEn: 'Ya-Sin', revelationType: 'makki', verseCount: 83, textChecksum: '' },
            { id: 49, nameAr: 'الحجرات', nameEn: 'Al-Hujurat', revelationType: 'madani', verseCount: 18, textChecksum: '' },
            { id: 55, nameAr: 'الرحمن', nameEn: 'Ar-Rahman', revelationType: 'madani', verseCount: 78, textChecksum: '' },
            { id: 67, nameAr: 'الملك', nameEn: 'Al-Mulk', revelationType: 'makki', verseCount: 30, textChecksum: '' },
          ];
          setSurahs(fallbackSurahs);
        }
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const toggleAction = (id: string) => {
    setActions((prev) =>
      prev.map((act) => (act.id === id ? { ...act, done: !act.done } : act))
    );
  };

  const completedActionsCount = actions.filter((a) => a.done).length;

  const filteredSurahs = surahs.filter(
    (s) =>
      s.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nameAr.includes(searchQuery) ||
      s.id.toString() === searchQuery.trim()
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="mut text-sm">Assalamu alaykum</div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[var(--ink)]">
            Ready for tonight's reflection?
          </h1>
        </div>

        <div className="w-full lg:w-96">
          <div className="search">
            <svg
              className="w-4 h-4 text-[var(--mut)] flex-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search a Surah, theme or verse"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-sm text-[var(--ink)] placeholder-[var(--mut)]"
            />
          </div>
        </div>
      </div>

      {/* Main Responsive Grid Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6 items-start">
        {/* Column 1: Continue Reading Hero + Browse Surahs */}
        <div className="xl:col-span-6 space-y-6">
          {/* Continue Reading Hero Card */}
          <div className="hero pat shadow-md relative overflow-hidden">
            <div className="sm text-white/75">Continue where you left off</div>
            <div className="ar text-3xl sm:text-4xl text-[var(--gold)] my-2">سورة الحجرات</div>
            <h3 className="text-xl font-serif font-semibold text-white">Al-Hujurat, verses 6 to 10</h3>
            <div className="sm text-white/80 mt-1 mb-5">
              Verifying news and making peace. Passage 2 of 3.
            </div>
            <button className="btn" onClick={() => onSelectSurah(49)}>
              Continue reading
            </button>
          </div>

          {/* Browse Surahs Grid */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-serif font-semibold text-[var(--ink)]">Browse Surahs</h3>
              <span className="sm font-semibold text-[var(--pri)] cursor-pointer" onClick={() => onSelectSurah(1)}>
                All 114
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredSurahs.slice(0, 6).map((s) => (
                <div
                  key={s.id}
                  onClick={() => onSelectSurah(s.id)}
                  className="card p-3 cursor-pointer hover:border-[var(--pri)] transition-all hover:shadow-sm"
                >
                    <div className="ar text-xl text-right text-[var(--ink)] mb-1">
                      {s.nameAr}
                    </div>
                    <b className="sm block text-[var(--ink)] truncate">{s.nameEn}</b>
                    <div className="mut text-[11px]">
                      {s.revelationType === 'makki' ? 'Makki' : 'Madani'} &bull; {s.verseCount} verses
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Column 2: Today's Actions + Reflection Week History */}
        <div className="xl:col-span-3 space-y-6">
          {/* Today's Actions */}
          <div className="card space-y-3">
            <div className="flex justify-between items-center pb-1">
              <h3 className="text-lg font-serif font-semibold text-[var(--ink)]">Today's actions</h3>
              <span className="chip cursor-pointer" onClick={onOpenActions}>
                {completedActionsCount} of {actions.length} done
              </span>
            </div>

            <div className="space-y-1">
              {actions.map((act) => (
                <div key={act.id} className="li cursor-pointer" onClick={() => toggleAction(act.id)}>
                  <div className={`ck ${act.done ? 'd' : ''}`}>{act.done ? '✓' : ''}</div>
                  <div className="flex-1">
                    <b className={`text-xs sm:text-sm font-medium ${act.done ? 'line-through opacity-60' : ''}`}>
                      {act.text}
                    </b>
                    <div className="mut text-[11px]">{act.verseRef}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reflection Week Summary */}
          <div className="card space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-serif font-semibold text-[var(--ink)]">This week</h3>
              <span className="sm mut">4 days of reflection</span>
            </div>

            <div className="wk my-2">
              <i className="d" title="Mon - Completed" />
              <i className="d" title="Tue - Completed" />
              <i title="Wed - Rest" />
              <i className="d" title="Thu - Completed" />
              <i className="d" title="Fri - Completed" />
              <i className="t" title="Sat - Today" />
              <i title="Sun - Upcoming" />
            </div>

            <div className="sm mut text-xs">Missing a day is fine. Pick up where you paused.</div>
          </div>
        </div>

        {/* Column 3: Surah Roadmap + Offline Chip (Widescreen layout) */}
        <div className="xl:col-span-3 space-y-6">
          {/* Surah Roadmap */}
          <div className="card space-y-3">
            <div className="flex justify-between items-center pb-1">
              <h3 className="text-lg font-serif font-semibold text-[var(--ink)]">Surah roadmap</h3>
              <span className="text-xs mut">Al-Hujurat</span>
            </div>

            <div className="space-y-1">
              <div className="li">
                <div className="ck d">✓</div>
                <div className="flex-1">
                  <b className="text-xs sm:text-sm">Verses 1 to 5</b>
                  <div className="mut text-[11px]">Manners with the Prophet ﷺ</div>
                </div>
              </div>

              <div className="li">
                <div className="ck border-[var(--pri)] text-[var(--pri)] font-bold">●</div>
                <div className="flex-1">
                  <b className="text-xs sm:text-sm text-[var(--pri)]">Verses 6 to 10</b>
                  <div className="mut text-[11px]">Verifying news, making peace</div>
                </div>
                <span className="chip">Now</span>
              </div>

              <div className="li border-0">
                <div className="ck"></div>
                <div className="flex-1">
                  <b className="text-xs sm:text-sm">Verses 11 to 18</b>
                  <div className="mut text-[11px]">Brotherhood and sincerity</div>
                </div>
              </div>
            </div>
          </div>

          {/* Downloaded Pack Status */}
          <div className="flex items-center gap-2">
            <span className="chip">Downloaded: works offline</span>
          </div>
        </div>
      </div>
    </div>
  );
}
