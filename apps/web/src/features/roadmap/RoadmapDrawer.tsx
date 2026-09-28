import { useEffect, useRef, KeyboardEvent } from 'react';
import { analytics } from '../../core/analytics';

export interface RoadmapBlockItem {
  id: string;
  title: string;
  verseStart: number;
  verseEnd: number;
  summary: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  surahId: number;
  surahNameEn: string;
  blocks: RoadmapBlockItem[];
  activeBlockId: string | null;
  onJumpToBlock: (blockId: string) => void;
}

export function RoadmapDrawer({
  isOpen,
  onClose,
  surahId,
  surahNameEn,
  blocks,
  activeBlockId,
  onJumpToBlock,
}: Props) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      analytics.track('roadmap_opened', { surah_id: surahId });
      // Focus drawer on open for screen-readers & keyboard navigation
      setTimeout(() => drawerRef.current?.focus(), 50);
    }
  }, [isOpen, surahId]);

  if (!isOpen) return null;

  function handleSelectBlock(blockId: string) {
    analytics.track('roadmap_jumped', { surah_id: surahId, block_id: blockId });
    onJumpToBlock(blockId);
    onClose();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-stone-900/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Thematic Roadmap for Surah ${surahNameEn}`}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-stone-50 h-full shadow-2xl flex flex-col border-l border-stone-200 focus:outline-none"
      >
        {/* Drawer Header */}
        <div className="p-5 bg-white border-b border-stone-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded">
              Surah Roadmap
            </span>
            <h2 className="text-lg font-serif font-bold text-stone-900 mt-1">
              {surahNameEn} ({blocks.length} Blocks)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-sm transition-colors"
            aria-label="Close roadmap drawer"
          >
            &times;
          </button>
        </div>

        {/* Roadmap Blocks List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {blocks.map((b, idx) => {
            const isActive = b.id === activeBlockId;
            return (
              <button
                key={b.id}
                onClick={() => handleSelectBlock(b.id)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'bg-amber-900 text-amber-50 border-amber-950 shadow-md ring-2 ring-amber-600/30'
                    : 'bg-white text-stone-900 border-stone-200 hover:border-amber-400 hover:bg-amber-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                      isActive ? 'bg-amber-950 text-amber-200' : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    Block {idx + 1} &bull; Verses {b.verseStart}–{b.verseEnd}
                  </span>
                  {isActive && <span className="text-xs text-amber-300 font-bold">● Active</span>}
                </div>
                <h3 className={`font-semibold text-sm mb-1 ${isActive ? 'text-amber-100' : 'text-stone-900'}`}>
                  {b.title}
                </h3>
                {b.summary && (
                  <p className={`text-xs leading-relaxed ${isActive ? 'text-amber-200/80' : 'text-stone-500'}`}>
                    {b.summary}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-white border-t border-stone-200 text-center text-xs text-stone-500">
          Tap any thematic block to jump directly (&lt;80ms transition)
        </div>
      </div>
    </div>
  );
}
