import { useEffect, useState } from 'react';
import { audioService, AudioState } from './audioService';

export function AudioPlayerBar() {
  const [state, setState] = useState<AudioState>(() => audioService.getState());

  useEffect(() => {
    return audioService.subscribe(setState);
  }, []);

  if (!state.currentVerseRef) return null;

  function formatTime(secs: number): string {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-stone-900 text-stone-100 border-t border-stone-800 p-3 px-4 md:px-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Active Verse & Reciter Metadata */}
      <div className="flex items-center space-x-3 rtl:space-x-reverse w-full md:w-auto">
        <div className="w-9 h-9 rounded-full bg-amber-900 text-amber-200 flex items-center justify-center font-bold text-xs shrink-0">
          ▶
        </div>
        <div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
              Verse {state.currentVerseRef}
            </span>
            {state.error && (
              <span className="text-[11px] text-rose-400 font-medium">
                {state.error}
              </span>
            )}
          </div>
          <p className="text-xs text-stone-300 font-medium mt-0.5">
            {state.reciterName}
          </p>
        </div>
      </div>

      {/* Playback Controls & Progress Slider */}
      <div className="flex items-center space-x-4 rtl:space-x-reverse w-full md:max-w-md">
        <button
          onClick={() => audioService.togglePlayPause()}
          className="p-2.5 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 shadow-sm transition-colors"
        >
          {state.isPlaying ? '❚❚' : '▶'}
        </button>

        <div className="flex-1 flex items-center space-x-2 text-xs font-mono text-stone-400">
          <span>{formatTime(state.currentTime)}</span>
          <input
            type="range"
            min={0}
            max={state.duration || 100}
            value={state.currentTime}
            onChange={(e) => audioService.seek(Number(e.target.value))}
            className="flex-1 accent-amber-500 h-1.5 bg-stone-700 rounded-lg cursor-pointer"
          />
          <span>{formatTime(state.duration)}</span>
        </div>
      </div>

      {/* Repeat Selector & Stop Button */}
      <div className="flex items-center space-x-3 rtl:space-x-reverse shrink-0">
        {/* Repeat count selector */}
        <div className="flex items-center space-x-1.5">
          <label htmlFor="repeatSelect" className="text-xs text-stone-400">Repeat:</label>
          <select
            id="repeatSelect"
            value={state.repeatCount}
            onChange={(e) => audioService.setRepeatCount(Number(e.target.value))}
            className="bg-stone-800 text-amber-300 text-xs font-semibold px-2 py-1 rounded border border-stone-700 focus:outline-none"
          >
            <option value={0}>Off</option>
            <option value={3}>3x</option>
            <option value={5}>5x</option>
            <option value={10}>10x</option>
            <option value={20}>20x</option>
          </select>
        </div>

        <button
          onClick={() => audioService.stop()}
          className="text-xs text-stone-400 hover:text-stone-100 p-1.5 rounded"
          title="Close player"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
