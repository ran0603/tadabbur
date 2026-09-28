import { useState } from 'react';
import { BlockEditor } from './features/blocks/BlockEditor';
import { ScholarReviewPanel } from './features/review/ScholarReviewPanel';
import { AuditLogViewer } from './features/audit/AuditLogViewer';

export default function App() {
  const [activeTab, setActiveTab] = useState<'editor' | 'review' | 'audit'>('editor');

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col">
      {/* Header */}
      <header className="bg-stone-900 text-stone-100 px-6 py-4 flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="text-xl font-bold tracking-tight text-amber-400">
            Tadabbur CMS
          </span>
          <span className="text-xs bg-amber-950 text-amber-300 border border-amber-800 px-2.5 py-0.5 rounded-full font-medium">
            Editorial Admin
          </span>
        </div>
        <nav className="flex items-center space-x-4 text-sm text-stone-300 rtl:space-x-reverse">
          <button
            onClick={() => setActiveTab('editor')}
            className={`font-medium transition-colors ${
              activeTab === 'editor' ? 'text-amber-400 underline underline-offset-4' : 'hover:text-stone-100'
            }`}
          >
            Block Editor
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`font-medium transition-colors ${
              activeTab === 'review' ? 'text-amber-400 underline underline-offset-4' : 'hover:text-stone-100'
            }`}
          >
            Scholar Review
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`font-medium transition-colors ${
              activeTab === 'audit' ? 'text-amber-400 underline underline-offset-4' : 'hover:text-stone-100'
            }`}
          >
            Audit Log
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
        {activeTab === 'editor' && (
          <BlockEditor surahId={78} surahNameEn="An-Naba" totalVerses={40} />
        )}
        {activeTab === 'review' && <ScholarReviewPanel />}
        {activeTab === 'audit' && <AuditLogViewer />}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-4 text-center text-xs text-stone-500">
        Tadabbur Editorial CMS &bull; Scholarly Review Workflow &bull; Audit Trail Logging
      </footer>
    </div>
  );
}
