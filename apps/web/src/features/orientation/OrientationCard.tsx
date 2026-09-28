import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { ORIENTATION_FIXTURE_MAP } from './orientationData';
import { analytics } from '../../core/analytics';
import { featureFlags } from '../../core/flags';

interface Props {
  surahId: number;
  onComplete: () => void;
}

export function OrientationCard({ surahId, onComplete }: Props) {
  const data = ORIENTATION_FIXTURE_MAP[surahId];
  const isMandatory = featureFlags.get('orientation_mandatory');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const completedLoggedRef = useRef<boolean>(false);

  useEffect(() => {
    analytics.track('orientation_shown', { surah_id: surahId });
    startTimeRef.current = Date.now();

    // Dwell over 45s timer
    const timer = setTimeout(() => {
      if (!completedLoggedRef.current) {
        completedLoggedRef.current = true;
        analytics.track('orientation_completed', { surah_id: surahId });
      }
    }, 45000);

    return () => clearTimeout(timer);
  }, [surahId]);

  if (!data) return null;

  const currentCard = data.cards[currentCardIndex];
  const isLastCard = currentCardIndex === data.cards.length - 1;

  function handleNext() {
    if (isLastCard) {
      if (!completedLoggedRef.current) {
        completedLoggedRef.current = true;
        analytics.track('orientation_completed', { surah_id: surahId });
      }
      onComplete();
    } else {
      setCurrentCardIndex((prev) => prev + 1);
    }
  }

  function handlePrev() {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
    }
  }

  function handleSkip() {
    const dwellMs = Date.now() - startTimeRef.current;
    analytics.track('orientation_dismissed', { surah_id: surahId, dwell_ms: dwellMs });
    onComplete();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'Escape' && (!isMandatory || isLastCard)) handleSkip();
  }

  return (
    <div
      role="region"
      aria-label={`Surah ${data.nameEn} Orientation Overview`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="bg-gradient-to-br from-amber-900 via-stone-900 to-stone-950 text-stone-100 rounded-2xl p-6 md:p-8 shadow-md border border-amber-900/40 space-y-6 focus:outline-none focus:ring-2 focus:ring-amber-500"
    >
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-amber-800/40 pb-4">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-800/50">
            Guided Orientation
          </span>
          <span className="text-xs text-stone-400 capitalize font-medium">
            {data.revelationType} &bull; {data.verseCount} verses
          </span>
        </div>

        {/* Skip button (one-tap skip by default unless mandatory & not on last card) */}
        {(!isMandatory || isLastCard) && (
          <button
            onClick={handleSkip}
            className="text-xs text-stone-300 hover:text-white font-medium bg-stone-800/60 hover:bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-700/50 transition-colors"
          >
            Skip to reading &rarr;
          </button>
        )}
      </div>

      {/* Surah Header */}
      <div>
        <h2 className="text-2xl font-serif font-bold text-amber-100" lang="ar" dir="rtl">
          {data.nameAr} ({data.nameEn})
        </h2>
        <p className="text-xs text-amber-200/80 mt-1 font-medium">{data.coreAxis}</p>
      </div>

      {/* Card Content Area */}
      {currentCard && (
        <div className="bg-stone-900/80 rounded-xl p-5 border border-stone-800 space-y-3 min-h-[140px] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-amber-300">{currentCard.title}</h3>
            <p className="text-sm text-stone-200 mt-1.5 leading-relaxed">{currentCard.content}</p>
          </div>
          {currentCard.source && (
            <span className="text-[10px] text-amber-400/80 italic self-end">
              Source: {currentCard.source}
            </span>
          )}
        </div>
      )}

      {/* Card Stepper & Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        {/* Step dots */}
        <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
          {data.cards.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentCardIndex ? 'w-6 bg-amber-400' : 'w-1.5 bg-stone-700'
              }`}
            />
          ))}
        </div>

        {/* Next / Previous Controls */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {currentCardIndex > 0 && (
            <button
              onClick={handlePrev}
              className="px-3 py-1.5 text-xs text-stone-300 hover:text-white bg-stone-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              Previous
            </button>
          )}
          <button
            onClick={handleNext}
            className="px-4 py-1.5 text-xs bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors shadow-sm"
          >
            {isLastCard ? 'Start reading' : 'Next card'}
          </button>
        </div>
      </div>
    </div>
  );
}
