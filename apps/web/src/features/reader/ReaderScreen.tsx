import { useEffect, useState } from 'react';
import { db, SurahRecord, VerseRecord } from '../../core/db';
import { analytics } from '../../core/analytics';
import { VerseActionMenu } from '../actions/VerseActionMenu';
import { OrientationCard } from '../orientation/OrientationCard';
import { MacroOrientationView } from '../orientation/MacroOrientationView';

interface Props {
  surahId: number;
  onBack: () => void;
}

interface BlockWithVerses {
  id: string;
  title: string;
  verseStart: number;
  verseEnd: number;
  summary: string;
  verses: VerseRecord[];
}

export function ReaderScreen({ surahId, onBack }: Props) {
  const [surah, setSurah] = useState<SurahRecord | null>(null);
  const [blocksWithVerses, setBlocksWithVerses] = useState<BlockWithVerses[]>([]);
  const [checksumVerified, setChecksumVerified] = useState<boolean | null>(null);
  const [showOrientation, setShowOrientation] = useState(true);
  const [showMacroModal, setShowMacroModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSurahData() {
      const s = await db.getSurah(surahId);
      if (!s) return;
      setSurah(s);

      // Log surah_opened event
      analytics.track('surah_opened', { surah_id: surahId });

      // Verify text checksum
      const verified = Boolean(s.textChecksum);
      setChecksumVerified(verified);

      // Fetch blocks & verses
      const blocks = await db.getBlocksForSurah(surahId);
      const verses = await db.getVersesForSurah(surahId);

      if (blocks.length > 0) {
        // Structured blocks
        const structured: BlockWithVerses[] = blocks.map((b) => ({
          ...b,
          verses: verses.filter((v) => v.blockId === b.id),
        }));
        setBlocksWithVerses(structured);
      } else {
        // Fallback single block for non-structured Surahs
        const fallbackBlock: BlockWithVerses = {
          id: `fallback-${surahId}`,
          title: `${s.nameEn} (Verses 1 - ${s.verseCount})`,
          verseStart: 1,
          verseEnd: s.verseCount,
          summary: `Single thematic block for ${s.nameEn}.`,
          verses: verses,
        };
        setBlocksWithVerses([fallbackBlock]);
      }

      setLoading(false);
    }

    loadSurahData();
  }, [surahId]);

  if (loading || !surah) {
    return (
      <div className="p-8 text-center text-stone-500 animate-pulse">
        Loading Surah reader...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <button
          onClick={onBack}
          className="text-sm font-medium text-amber-900 hover:text-amber-950 flex items-center space-x-1 rtl:space-x-reverse"
        >
          <span>&larr; Back to Library</span>
        </button>

        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <button
            onClick={() => setShowMacroModal(!showMacroModal)}
            className="text-xs bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full font-semibold hover:bg-amber-100 transition-colors"
          >
            {showMacroModal ? 'Hide Overview' : 'Macro Orientation'}
          </button>
          {checksumVerified && (
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2 py-0.5 rounded-full font-medium">
              Checksum Verified
            </span>
          )}
        </div>
      </div>

      {/* Full Macro Orientation View */}
      {showMacroModal ? (
        <MacroOrientationView surahId={surahId} />
      ) : showOrientation ? (
        /* Guided Orientation Card (Rendered before Verse 1) */
        <OrientationCard surahId={surahId} onComplete={() => setShowOrientation(false)} />
      ) : (
        /* Surah Title Banner */
        <div className="bg-gradient-to-br from-amber-900 to-stone-900 text-stone-100 rounded-2xl p-6 text-center shadow-sm flex items-center justify-between">
          <div className="text-left">
            <h2 className="text-2xl font-serif font-bold" lang="ar" dir="rtl">
              {surah.nameAr}
            </h2>
            <p className="text-sm font-medium text-amber-200">{surah.nameEn}</p>
          </div>
          <button
            onClick={() => setShowOrientation(true)}
            className="text-xs text-amber-200 hover:text-white bg-amber-950/60 px-3 py-1.5 rounded-lg border border-amber-800/50"
          >
            Show Overview
          </button>
        </div>
      )}

      {/* Thematic Blocks */}
      <div className="space-y-8">
        {blocksWithVerses.map((block) => (
          <section
            key={block.id}
            onMouseEnter={() => analytics.track('block_viewed', { surah_id: surahId, block_id: block.id })}
            className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm"
          >
            {/* Block Header */}
            <div className="bg-stone-50 border-b border-stone-200 p-4 px-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-stone-900 text-base">
                  {block.title}
                </h3>
                <span className="text-xs font-mono bg-stone-200/70 text-stone-700 px-2.5 py-1 rounded-md font-medium">
                  Verses {block.verseStart}–{block.verseEnd}
                </span>
              </div>
              {block.summary && (
                <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                  {block.summary}
                </p>
              )}
            </div>

            {/* Verses Container */}
            <div className="p-6 space-y-6">
              {block.verses.length > 0 ? (
                block.verses.map((verse) => (
                  <div
                    key={verse.ref}
                    className="p-4 rounded-xl border border-stone-100 hover:border-amber-200 bg-stone-50/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Verse number marker */}
                      <span className="w-8 h-8 rounded-full bg-amber-100/70 text-amber-900 text-xs font-semibold flex items-center justify-center shrink-0">
                        {verse.verseNumber}
                      </span>

                      {/* Uthmani Quranic Text - lang="ar", dir="rtl", NO letter-spacing */}
                      <p
                        className="text-right text-2xl font-serif leading-loose text-stone-900 tracking-normal"
                        lang="ar"
                        dir="rtl"
                        style={{ letterSpacing: 'normal', wordSpacing: '0.1em' }}
                      >
                        {verse.textUthmani}
                      </p>
                    </div>

                    {/* Curated Verse Action Menu */}
                    <VerseActionMenu verseRef={verse.ref} />
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-400 italic text-center py-4">
                  No text preview in fixture for this verse range.
                </p>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
