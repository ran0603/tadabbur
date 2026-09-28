import { useState } from 'react';
import { ErrorBoundary } from './core/errors/ErrorBoundary';
import { i18n } from './core/i18n';
import { SurahList } from './features/reader/SurahList';
import { ReaderScreen } from './features/reader/ReaderScreen';

function TadabburShell() {
  const [selectedSurahId, setSelectedSurahId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur sticky top-0 z-20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <button
            onClick={() => setSelectedSurahId(null)}
            className="text-xl font-bold tracking-tight text-amber-900 hover:text-amber-950 transition-colors"
          >
            {i18n.t('common', 'appName')}
          </button>
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
            MVP Stage A
          </span>
        </div>
        <nav className="flex items-center space-x-4 text-sm text-stone-600 rtl:space-x-reverse">
          <button
            onClick={() => setSelectedSurahId(null)}
            className={`font-medium transition-colors ${
              selectedSurahId === null ? 'text-stone-900 underline underline-offset-4' : 'hover:text-stone-900'
            }`}
          >
            {i18n.t('common', 'library')}
          </button>
          <span>{i18n.t('common', 'today')}</span>
          <span>{i18n.t('common', 'journal')}</span>
          <span>{i18n.t('common', 'settings')}</span>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6">
        {selectedSurahId === null ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <h1 className="text-xl font-serif font-bold text-stone-900 mb-1">
                Mushaf Reader
              </h1>
              <p className="text-xs text-stone-600">
                Read Quranic Surahs in thematic blocks with offline verification.
              </p>
            </div>
            <SurahList onSelectSurah={(id) => setSelectedSurahId(id)} />
          </div>
        ) : (
          <ReaderScreen
            surahId={selectedSurahId}
            onBack={() => setSelectedSurahId(null)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-4 text-center text-xs text-stone-500">
        Tadabbur MVP &bull; Offline PWA Shell &bull; Religious Content Integrity First
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <TadabburShell />
    </ErrorBoundary>
  );
}
