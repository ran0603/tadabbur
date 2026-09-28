import { useEffect, useState } from 'react';
import { db, SurahRecord, VerseRecord } from '../../core/db';
import { analytics } from '../../core/analytics';
import { VerseActionMenu } from '../actions/VerseActionMenu';
import { OrientationCard } from '../orientation/OrientationCard';
import { MacroOrientationView } from '../orientation/MacroOrientationView';
import { OpeningClosingLinkModule } from '../orientation/OpeningClosingLinkModule';
import { RoadmapDrawer } from '../roadmap/RoadmapDrawer';
import { typographyService, TypographySettings } from '../settings/typographySettings';
import { TypographyControlsModal } from '../settings/TypographyControlsModal';
import { audioService, AudioState } from '../audio/audioService';
import { AudioPlayerBar } from '../audio/AudioPlayerBar';
import { JournalEditor } from '../journal/JournalEditor';

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
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showTypographyModal, setShowTypographyModal] = useState(false);
  const [activeJournalVerseRef, setActiveJournalVerseRef] = useState<string | null>(null);
  const [typography, setTypography] = useState<TypographySettings>(() => typographyService.getSettings());
  const [audioState, setAudioState] = useState<AudioState>(() => audioService.getState());
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return audioService.subscribe(setAudioState);
  }, []);

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
        setActiveBlockId(structured[0]?.id || null);
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
        setActiveBlockId(fallbackBlock.id);
      }

      setLoading(false);
    }

    loadSurahData();
  }, [surahId]);

  function handleJumpToVerse(verseRef: string) {
    const el = document.getElementById(`verse-${verseRef}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-amber-500');
      setTimeout(() => el.classList.remove('ring-2', 'ring-amber-500'), 2500);
    }
  }

  function handleJumpToBlock(blockId: string) {
    setActiveBlockId(blockId);
    const el = document.getElementById(`block-${blockId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  if (loading || !surah) {
    return (
      <div className="p-8 text-center text-stone-500 animate-pulse">
        Loading Surah reader...
      </div>
    );
  }

  const baseFontSizeRem = (typography.fontScale / 100) * 1.5;

  return (
    <div className="space-y-6 pb-20">
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
            onClick={() => setShowTypographyModal(true)}
            className="text-xs bg-stone-100 text-stone-800 hover:bg-stone-200 border border-stone-200 px-3 py-1 rounded-full font-semibold transition-colors flex items-center space-x-1 rtl:space-x-reverse"
          >
            <span>Aa Typography</span>
          </button>
          <button
            onClick={() => setShowRoadmap(true)}
            className="text-xs bg-stone-900 text-stone-100 hover:bg-stone-800 px-3 py-1 rounded-full font-semibold transition-colors flex items-center space-x-1 rtl:space-x-reverse"
          >
            <span>🗺️ Roadmap</span>
          </button>
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

      {/* Opening-Closing Symmetry Link Module */}
      <OpeningClosingLinkModule surahId={surahId} onJumpToVerse={handleJumpToVerse} />

      {/* Thematic Blocks */}
      <div className="space-y-8">
        {blocksWithVerses.map((block) => (
          <section
            id={`block-${block.id}`}
            key={block.id}
            onMouseEnter={() => {
              setActiveBlockId(block.id);
              analytics.track('block_viewed', { surah_id: surahId, block_id: block.id });
            }}
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
                block.verses.map((verse) => {
                  const isVersePlaying = audioState.currentVerseRef === verse.ref && audioState.isPlaying;
                  return (
                    <div
                      id={`verse-${verse.ref}`}
                      key={verse.ref}
                      className={`p-4 rounded-xl border transition-all duration-300 ${
                        isVersePlaying
                          ? 'border-amber-400 bg-amber-50/60 ring-2 ring-amber-500/20 shadow-sm'
                          : 'border-stone-100 hover:border-amber-200 bg-stone-50/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* Verse controls & marker */}
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="w-8 h-8 rounded-full bg-amber-100/70 text-amber-900 text-xs font-semibold flex items-center justify-center">
                            {verse.verseNumber}
                          </span>
                          <button
                            onClick={() => audioService.playVerse(verse.ref, surahId)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
                              isVersePlaying
                                ? 'bg-amber-900 text-amber-100'
                                : 'bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-950'
                            }`}
                          >
                            <span>{isVersePlaying ? '❚❚ Playing' : '▶ Play'}</span>
                          </button>
                          <button
                            onClick={() => setActiveJournalVerseRef(verse.ref)}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 transition-colors"
                          >
                            ✏️ Note
                          </button>
                        </div>

                        {/* Uthmani Quranic Text - lang="ar", dir="rtl", NO letter-spacing */}
                        <p
                          className="text-right font-serif text-stone-900 tracking-normal transition-all"
                          lang="ar"
                          dir="rtl"
                          style={{
                            fontSize: `${baseFontSizeRem}rem`,
                            wordSpacing: `${typography.wordSpacing}em`,
                            lineHeight: typography.lineHeight,
                            letterSpacing: 'normal',
                          }}
                        >
                          {verse.textUthmani}
                        </p>
                      </div>

                      {/* Curated Verse Action Menu */}
                      <VerseActionMenu verseRef={verse.ref} />
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-stone-400 italic text-center py-4">
                  No text preview in fixture for this verse range.
                </p>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* Roadmap Drawer Component */}
      <RoadmapDrawer
        isOpen={showRoadmap}
        onClose={() => setShowRoadmap(false)}
        surahId={surahId}
        surahNameEn={surah.nameEn}
        blocks={blocksWithVerses}
        activeBlockId={activeBlockId}
        onJumpToBlock={handleJumpToBlock}
      />

      {/* Typography Controls Modal */}
      <TypographyControlsModal
        isOpen={showTypographyModal}
        onClose={() => setShowTypographyModal(false)}
        onSettingsChanged={(updated) => setTypography(updated)}
      />

      {/* Journal Editor Modal */}
      {activeJournalVerseRef && (
        <JournalEditor
          verseRef={activeJournalVerseRef}
          isOpen={Boolean(activeJournalVerseRef)}
          onClose={() => setActiveJournalVerseRef(null)}
        />
      )}

      {/* Sticky Audio Controls Bar */}
      <AudioPlayerBar />
    </div>
  );
}
