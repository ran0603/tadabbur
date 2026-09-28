import { useState } from 'react';
import { getSurahOrientation } from './surahOrientationCatalog';
import { analytics } from '../../core/analytics';

interface Props {
  surahId: number;
}

export function MacroOrientationView({ surahId }: Props) {
  const data = getSurahOrientation(surahId);
  const [expandedSection, setExpandedSection] = useState<'axis' | 'names' | 'virtues' | null>('axis');

  function toggleSection(section: 'axis' | 'names' | 'virtues') {
    const next = expandedSection === section ? null : section;
    setExpandedSection(next);
    if (next) {
      analytics.track('orientation_section_expanded', { surah_id: surahId });
    }
  }

  const hasDetails = Boolean(data.centralTheme || data.names.length > 0 || data.virtues.length > 0);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
      {/* Surah Header Banner */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md">
            Macro Orientation
          </span>
          <h2 className="text-2xl font-serif font-bold text-stone-900 mt-2">
            Surah {data.id}: {data.nameEn}
          </h2>
          <p className="text-xs text-stone-500 capitalize mt-0.5">
            Revelation: {data.revelationType} &bull; {data.verseCount} Verses
          </p>
        </div>
        <span className="font-serif text-3xl font-bold text-amber-900" lang="ar" dir="rtl">
          {data.nameAr}
        </span>
      </div>

      {/* Content Sections or Graceful Fallback */}
      {!hasDetails ? (
        <div className="bg-stone-50 rounded-xl p-6 text-center space-y-2 border border-stone-200/60">
          <p className="text-sm font-semibold text-stone-700">Guided overview coming soon</p>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Detailed scholarly orientation for {data.nameEn} is undergoing editorial review. You can proceed directly to reading below.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Core Axis Section */}
          {data.centralTheme && (
            <div className="border border-stone-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('axis')}
                className="w-full p-4 text-left font-semibold text-sm text-stone-900 bg-stone-50 hover:bg-stone-100 flex items-center justify-between transition-colors"
              >
                <span>Core Axis & Central Theme</span>
                <span className="text-xs font-mono text-stone-500">
                  {expandedSection === 'axis' ? '▲ Hide' : '▼ Expand'}
                </span>
              </button>
              {expandedSection === 'axis' && (
                <div className="p-4 bg-white text-sm text-stone-700 leading-relaxed border-t border-stone-200">
                  {data.centralTheme}
                </div>
              )}
            </div>
          )}

          {/* Names & Meanings Section */}
          {data.names.length > 0 && (
            <div className="border border-stone-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('names')}
                className="w-full p-4 text-left font-semibold text-sm text-stone-900 bg-stone-50 hover:bg-stone-100 flex items-center justify-between transition-colors"
              >
                <span>Surah Names & Attributed Meanings ({data.names.length})</span>
                <span className="text-xs font-mono text-stone-500">
                  {expandedSection === 'names' ? '▲ Hide' : '▼ Expand'}
                </span>
              </button>
              {expandedSection === 'names' && (
                <div className="p-4 bg-white space-y-3 border-t border-stone-200">
                  {data.names.map((n, i) => (
                    <div key={i} className="p-3 rounded-lg bg-stone-50 border border-stone-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-stone-900">{n.name} &bull; {n.meaning}</span>
                        <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-mono">
                          Source: {n.source}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Virtues Section */}
          {data.virtues.length > 0 && (
            <div className="border border-stone-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('virtues')}
                className="w-full p-4 text-left font-semibold text-sm text-stone-900 bg-stone-50 hover:bg-stone-100 flex items-center justify-between transition-colors"
              >
                <span>Virtues & Significance ({data.virtues.length})</span>
                <span className="text-xs font-mono text-stone-500">
                  {expandedSection === 'virtues' ? '▲ Hide' : '▼ Expand'}
                </span>
              </button>
              {expandedSection === 'virtues' && (
                <div className="p-4 bg-white space-y-3 border-t border-stone-200">
                  {data.virtues.map((v, i) => (
                    <div key={i} className="p-3 rounded-lg bg-stone-50 border border-stone-100 space-y-1">
                      <p className="text-xs text-stone-800 leading-relaxed font-medium">"{v.text}"</p>
                      <span className="text-[10px] text-stone-500 italic block text-right">
                        Source: {v.source}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
