import { ErrorBoundary } from './core/errors/ErrorBoundary';
import { i18n } from './core/i18n';
import { featureFlags } from './core/flags';

function TadabburShell() {
  const flags = featureFlags.getAll();

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur sticky top-0 z-20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="text-xl font-bold tracking-tight text-amber-900">
            {i18n.t('common', 'appName')}
          </span>
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
            MVP Stage A
          </span>
        </div>
        <nav className="flex items-center space-x-4 text-sm text-stone-600 rtl:space-x-reverse">
          <span className="font-medium text-stone-900">{i18n.t('common', 'library')}</span>
          <span>{i18n.t('common', 'today')}</span>
          <span>{i18n.t('common', 'journal')}</span>
          <span>{i18n.t('common', 'settings')}</span>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6">
        <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
          <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">
            Quranic Reflection & Action
          </h1>
          <p className="text-stone-600 mb-6">
            Offline-first Mushaf reader with thematic blocks, orientation cards, and private encrypted reflections.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-stone-100">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/60">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Active Flags
              </span>
              <ul className="mt-2 text-xs font-mono space-y-1 text-stone-700">
                {Object.entries(flags).map(([key, val]) => (
                  <li key={key} className="flex justify-between">
                    <span>{key}:</span>
                    <span className={val ? 'text-emerald-700 font-bold' : 'text-stone-400'}>
                      {String(val)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                Audio Reciter baseline
              </span>
              <p className="mt-2 text-sm text-amber-950 font-medium">
                Sheikh Maher Al Muaiqly (Ayah-by-Ayah)
              </p>
              <p className="mt-1 text-xs text-amber-800/80">
                Source path: <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">/content/source/audio/maher_al_muaiqly/</code>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-4 text-center text-xs text-stone-500">
        Tadabbur MVP &bull; Offline PWA Shell &bull; Privacy & E2E Encryption First
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
