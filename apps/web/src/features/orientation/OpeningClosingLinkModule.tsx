import { useEffect } from 'react';
import { analytics } from '../../core/analytics';

export interface SymmetryData {
  surahId: number;
  openingRef: string;
  openingText: string;
  closingRef: string;
  closingText: string;
  commentary: string;
}

export const SYMMETRY_DATA_MAP: Record<number, SymmetryData> = {
  78: {
    surahId: 78,
    openingRef: '78:1',
    openingText: 'عَمَّ يَتَسَاءَلُونَ ۝ عَنِ النَّبَإِ الْعَظِيمِ',
    closingRef: '78:40',
    closingText: 'إِنَّا أَنذَرْنَاكُمْ عَذَابًا قَرِيبًا يَوْمَ يَنظُرُ الْمَرْءُ مَا قَدَّمَتْ يَدَاهُ',
    commentary: 'Surah An-Naba opens with questions inquiring about the Great News of the Resurrection (Verses 1-2), and closes with the ultimate reality of that day where man sees what his hands sent forth (Verse 40).',
  },
  1: {
    surahId: 1,
    openingRef: '1:1',
    openingText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    closingRef: '1:7',
    closingText: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    commentary: 'Opens with praise and recognition of Allah\'s divine mercy, and concludes with the personal prayer to be kept on the path of those favoured.',
  },
  112: {
    surahId: 112,
    openingRef: '112:1',
    openingText: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
    closingRef: '112:4',
    closingText: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
    commentary: 'Opens with the declaration of Allah\'s absolute oneness, and closes asserting that there is none comparable unto Him.',
  },
};

interface Props {
  surahId: number;
  onJumpToVerse: (verseRef: string) => void;
}

export function OpeningClosingLinkModule({ surahId, onJumpToVerse }: Props) {
  const data = SYMMETRY_DATA_MAP[surahId];

  useEffect(() => {
    if (data) {
      analytics.track('symmetry_viewed', { surah_id: surahId });
    }
  }, [surahId, data]);

  if (!data) return null;

  return (
    <div className="bg-amber-950/90 text-amber-50 rounded-2xl p-6 shadow-md border border-amber-800/60 space-y-5">
      {/* Module Title */}
      <div className="flex items-center justify-between border-b border-amber-800/60 pb-3">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <span className="text-xs font-semibold uppercase tracking-wider bg-amber-900 text-amber-200 px-2.5 py-1 rounded-md border border-amber-700/50">
            Symmetry & Link
          </span>
          <h3 className="text-sm font-semibold text-amber-100">Opening & Closing Link</h3>
        </div>
      </div>

      {/* Commentary text */}
      <p className="text-xs text-amber-200/90 leading-relaxed font-medium bg-amber-900/40 p-3.5 rounded-xl border border-amber-800/40">
        {data.commentary}
      </p>

      {/* Endpoints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Opening Endpoint */}
        <button
          onClick={() => onJumpToVerse(data.openingRef)}
          className="p-4 rounded-xl bg-amber-900/50 hover:bg-amber-900/80 border border-amber-800/60 transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-amber-300 bg-amber-950 px-2 py-0.5 rounded">
              Opening {data.openingRef}
            </span>
            <span className="text-[10px] text-amber-300 group-hover:underline">Jump to verse &rarr;</span>
          </div>
          <p className="text-right text-lg font-serif text-amber-100 leading-relaxed" lang="ar" dir="rtl">
            {data.openingText}
          </p>
        </button>

        {/* Closing Endpoint */}
        <button
          onClick={() => onJumpToVerse(data.closingRef)}
          className="p-4 rounded-xl bg-amber-900/50 hover:bg-amber-900/80 border border-amber-800/60 transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-amber-300 bg-amber-950 px-2 py-0.5 rounded">
              Closing {data.closingRef}
            </span>
            <span className="text-[10px] text-amber-300 group-hover:underline">Jump to verse &rarr;</span>
          </div>
          <p className="text-right text-lg font-serif text-amber-100 leading-relaxed" lang="ar" dir="rtl">
            {data.closingText}
          </p>
        </button>
      </div>
    </div>
  );
}
