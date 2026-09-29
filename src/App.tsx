import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SurahCard } from './components/SurahCard';
import { AxisViewer } from './components/AxisViewer';
import { QuickWirdModal } from './components/QuickWirdModal';
import { JournalEditor } from './components/JournalEditor';
import { EnrichmentHub } from './components/enrichment/EnrichmentHub';
import { SettingsView } from './components/SettingsView';

import { useSurahStore } from './stores/useSurahStore';
import { useReflectionStore } from './stores/useReflectionStore';
import { useSettingsStore } from './stores/useSettingsStore';
import { Search, Filter, BookOpen, Sparkles, Layers, Heart, X } from 'lucide-react';

export function App() {
  const {
    surahs,
    selectedSurahId,
    setSelectedSurahId,
    searchQuery,
    setSearchQuery,
    selectedJuz,
    setSelectedJuz,
    selectedRevelation,
    setSelectedRevelation,
    getFilteredSurahs,
    initializeData,
  } = useSurahStore();

  const { loadReflections } = useReflectionStore();
  const { fontSize, theme, showDailyMottoBanner, setShowDailyMottoBanner } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<string>('surahs');
  const [isQuickWirdOpen, setIsQuickWirdOpen] = useState<boolean>(false);
  const [isJournalOpen, setIsJournalOpen] = useState<boolean>(false);

  useEffect(() => {
    initializeData();
    loadReflections();
  }, [initializeData, loadReflections]);

  const filteredSurahs = getFilteredSurahs();
  const currentSurah = surahs.find((s) => s.id === selectedSurahId) || surahs[0];

  const handleOpenQuickWird = (id?: number) => {
    if (id) setSelectedSurahId(id);
    setIsQuickWirdOpen(true);
  };

  const handleOpenJournal = (id?: number) => {
    if (id) setSelectedSurahId(id);
    setIsJournalOpen(true);
  };

  return (
    <div className={`min-h-screen flex flex-col font-scale-${fontSize}`}>
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickWird={() => handleOpenQuickWird(selectedSurahId)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Daily Motto Reminder Banner Widget */}
        {showDailyMottoBanner && activeTab === 'surahs' && (
          <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-slate-900 text-amber-50 p-4 sm:p-5 rounded-2xl shadow-md flex items-center justify-between gap-4 border border-amber-700/30 relative overflow-hidden">
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
              </div>
              <div>
                <span className="text-xs text-amber-300 font-bold font-cairo block">
                  الشعار اليومي للمتدبر:
                </span>
                <p className="font-amiri font-bold text-lg sm:text-xl text-white">
                  ﴿لَيَرَينَّ اللَّهُ مَا أَصْنَعُ﴾ — سر القرآن هو العمل به!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 relative z-10 shrink-0">
              <button
                onClick={() => setActiveTab('enrichment')}
                className="hidden sm:inline-flex items-center gap-1 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 px-3 py-1.5 rounded-lg border border-amber-500/30 transition-colors font-medium"
              >
                زاد المتدبر
              </button>
              <button
                onClick={() => setShowDailyMottoBanner(false)}
                className="p-1 rounded-lg text-amber-300 hover:text-white hover:bg-white/10 transition-colors"
                title="إغلاق التنبيه"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: SURAHS EXPLORER & 8-AXES VIEW */}
        {activeTab === 'surahs' && (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search Box */}
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث باسم السورة، رقمها، موضوعها، أو باسم آخر (مثال: الفاتحة، الكهف، الزهراء)..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 pr-10 pl-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-amber-600 focus:outline-none transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      إلغاء
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Revelation Type Filter */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    {(['الكل', 'مكية', 'مدنية'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedRevelation(type)}
                        className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all ${
                          selectedRevelation === type
                            ? 'bg-amber-800 text-white dark:bg-amber-600 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {/* Juz Filter Dropdown */}
                  <div className="flex items-center gap-1">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                      value={selectedJuz === null ? '' : selectedJuz}
                      onChange={(e) =>
                        setSelectedJuz(e.target.value === '' ? null : Number(e.target.value))
                      }
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-600 focus:outline-none"
                    >
                      <option value="">كل الأجزاء (30)</option>
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                        <option key={j} value={j}>
                          الجزء {j}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Split View: Surah Selector List + 8 Axis Detailed Viewer */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Surah List Column (4 cols on lg) */}
              <div className="lg:col-span-5 space-y-3 max-h-[85vh] overflow-y-auto no-scrollbar pr-1">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium px-1">
                  <span>سور القرآن الكريم ({filteredSurahs.length})</span>
                  <span>اضغط لعرض المحاور الثمانية</span>
                </div>

                {filteredSurahs.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 text-center space-y-2">
                    <p className="text-sm text-slate-500">لم يتم العثور على سورة تطابق البحث.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedJuz(null);
                        setSelectedRevelation('الكل');
                      }}
                      className="text-xs text-amber-700 font-semibold underline"
                    >
                      إعادة ضبط الفلاتر
                    </button>
                  </div>
                ) : (
                  filteredSurahs.map((surahItem) => (
                    <SurahCard
                      key={surahItem.id}
                      surah={surahItem}
                      isSelected={surahItem.id === selectedSurahId}
                      onSelect={() => setSelectedSurahId(surahItem.id)}
                      onQuickWird={() => handleOpenQuickWird(surahItem.id)}
                    />
                  ))
                )}
              </div>

              {/* Axis Viewer Detailed Column (7 cols on lg) */}
              <div className="lg:col-span-7 sticky top-24">
                {currentSurah ? (
                  <AxisViewer
                    surah={currentSurah}
                    onOpenQuickWird={() => handleOpenQuickWird(currentSurah.id)}
                    onOpenReflection={() => handleOpenJournal(currentSurah.id)}
                  />
                ) : (
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 text-center">
                    <p className="text-slate-500">اختر سورة من القائمة لعرض المحاور الثمانية التفصيلية.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BEFORE DAILY WIRD MODE VIEW */}
        {activeTab === 'wird' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-amber-800 to-amber-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-300" />
                <h2 className="font-amiri font-bold text-3xl">وضع قبل قراءة الورْد اليومي</h2>
              </div>
              <p className="text-amber-100 text-sm leading-relaxed max-w-2xl font-cairo">
                المنهجية الرئيسية التي أوصى بها مؤلف الكتاب الشيخ عادل خليل: مراجعة مقصد السورة ومحورها الأصلي لمدة 2–3 دقائق مباشرة قبل الشروع في تلاوة مصحفك، حتى تقرأ بعقل حاضر وقلب متأثر.
              </p>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => handleOpenQuickWird(selectedSurahId)}
                  className="px-6 py-3 rounded-2xl bg-white text-amber-900 hover:bg-amber-50 font-bold text-sm transition-all shadow-md active:scale-95"
                >
                  افتح بطاقة سورة {currentSurah.name_ar} (قبل الورْد)
                </button>
              </div>
            </div>

            {/* Quick surahs grid selector */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-amber-100 text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-700" />
                اختر سورة ورْدك اليومي لقراءتها بسرعة:
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {surahs.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleOpenQuickWird(s.id)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-100/60 dark:hover:bg-amber-950/40 border border-slate-200/60 dark:border-slate-800 text-right transition-colors group"
                  >
                    <span className="text-[11px] text-amber-800 dark:text-amber-400 font-bold block">
                      السورة {s.id}
                    </span>
                    <span className="font-amiri font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-amber-800">
                      سورة {s.name_ar}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PERSONAL REFLECTION JOURNAL VIEW */}
        {activeTab === 'journal' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 flex items-center justify-between">
              <div>
                <h2 className="font-amiri font-bold text-3xl text-slate-900 dark:text-rose-100 flex items-center gap-2">
                  <Heart className="w-7 h-7 text-rose-600 fill-rose-600" />
                  دفتر التأملات والالتزامات (تدبر وعمل)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  ﴿سر القرآن هو العمل به﴾ - سجل خواطرك الإيمانية والتزاماتك السلوكية لكل سورة.
                </p>
              </div>

              <button
                onClick={() => setIsJournalOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-rose-700 hover:bg-rose-800 text-white font-semibold text-sm transition-all shadow-md"
              >
                افتح محرر التأملات
              </button>
            </div>

            <JournalEditor
              surah={currentSurah}
              allSurahs={surahs}
              isOpen={isJournalOpen}
              onClose={() => setIsJournalOpen(false)}
            />
          </div>
        )}

        {/* TAB 4: SPIRITUAL ENRICHMENT HUB */}
        {activeTab === 'enrichment' && <EnrichmentHub />}

        {/* TAB 5: APP SETTINGS & CLOUD SYNC */}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Global Quick Wird Modal */}
      <QuickWirdModal
        surah={currentSurah}
        isOpen={isQuickWirdOpen}
        onClose={() => setIsQuickWirdOpen(false)}
        onSelectSurah={(id) => setSelectedSurahId(id)}
        allSurahs={surahs}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
