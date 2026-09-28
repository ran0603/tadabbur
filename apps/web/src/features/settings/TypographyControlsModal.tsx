import { useState, useEffect } from 'react';
import { typographyService, TypographySettings } from './typographySettings';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChanged: (settings: TypographySettings) => void;
}

export function TypographyControlsModal({ isOpen, onClose, onSettingsChanged }: Props) {
  const [settings, setSettings] = useState<TypographySettings>(() => typographyService.getSettings());

  useEffect(() => {
    if (isOpen) {
      setSettings(typographyService.getSettings());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleChange<K extends keyof TypographySettings>(key: K, value: number) {
    const updated = typographyService.updateSettings({ [key]: value });
    setSettings(updated);
    onSettingsChanged(updated);
  }

  function handleReset() {
    const reset = typographyService.resetToDefault();
    setSettings(reset);
    onSettingsChanged(reset);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Mushaf Typography Settings"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 p-6 space-y-6 text-stone-900"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Mushaf Typography</h2>
            <p className="text-xs text-stone-500">
              Customizable font scaling, word spacing & line height
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-sm"
          >
            &times;
          </button>
        </div>

        {/* Live Preview Box */}
        <div className="bg-stone-50 p-6 rounded-xl border border-stone-200/80 text-center space-y-2 overflow-hidden">
          <span className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider block">
            Live Preview (Arabic Ligatures Preserved)
          </span>
          <p
            className="font-serif text-stone-900 leading-normal"
            lang="ar"
            dir="rtl"
            style={{
              fontSize: `${(settings.fontScale / 100) * 1.5}rem`,
              wordSpacing: `${settings.wordSpacing}em`,
              lineHeight: settings.lineHeight,
              letterSpacing: 'normal',
            }}
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        </div>

        {/* Controls */}
        <div className="space-y-5">
          {/* Font Scale Control */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <label htmlFor="fontScaleSlider">Font Scale</label>
              <span className="font-mono text-amber-900 font-bold">{settings.fontScale}%</span>
            </div>
            <input
              id="fontScaleSlider"
              type="range"
              min={100}
              max={200}
              step={5}
              value={settings.fontScale}
              onChange={(e) => handleChange('fontScale', Number(e.target.value))}
              className="w-full accent-amber-800"
            />
          </div>

          {/* Word Spacing Control */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <label htmlFor="wordSpacingSlider">Word Spacing</label>
              <span className="font-mono text-amber-900 font-bold">{settings.wordSpacing.toFixed(2)}em</span>
            </div>
            <input
              id="wordSpacingSlider"
              type="range"
              min={0.05}
              max={0.3}
              step={0.01}
              value={settings.wordSpacing}
              onChange={(e) => handleChange('wordSpacing', Number(e.target.value))}
              className="w-full accent-amber-800"
            />
          </div>

          {/* Line Height Control */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <label htmlFor="lineHeightSlider">Line Height</label>
              <span className="font-mono text-amber-900 font-bold">{settings.lineHeight.toFixed(1)}</span>
            </div>
            <input
              id="lineHeightSlider"
              type="range"
              min={1.8}
              max={2.8}
              step={0.1}
              value={settings.lineHeight}
              onChange={(e) => handleChange('lineHeight', Number(e.target.value))}
              className="w-full accent-amber-800"
            />
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-200">
          <button
            onClick={handleReset}
            className="text-xs text-stone-500 hover:text-stone-800 font-medium underline"
          >
            Reset to default
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
