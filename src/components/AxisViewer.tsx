import React, { useState } from 'react';
import { Surah } from '../types/quran';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  Award,
  GitCommit,
  Compass,
  ListOrdered,
  Lightbulb,
  Heart,
  Share2,
  Bookmark,
  Check,
  Info
} from 'lucide-react';
import { useReflectionStore } from '../stores/useReflectionStore';

interface AxisViewerProps {
  surah: Surah;
  onOpenQuickWird: () => void;
  onOpenReflection: () => void;
}

export const AxisViewer: React.FC<AxisViewerProps> = ({ surah, onOpenQuickWird, onOpenReflection }) => {
  const { isBookmarked, toggleBookmark } = useReflectionStore();
  const bookmarked = isBookmarked(surah.id);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'themes' | 'topics' | 'gems'>('all');

  const handleCopySummary = () => {
    const text = `سورة ${surah.name_ar} (${surah.revelation_type} - ${surah.verses_count} آية)\nالمحور الرئيسي: ${surah.central_theme}\nمشاركة عبر تطبيق أول مرة أتدبر القرآن`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-br from-amber-900/10 via-amber-800/5 to-transparent dark:from-amber-900/30 dark:via-slate-900 p-6 rounded-3xl border border-amber-800/20 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-800 text-amber-50 text-xs px-2.5 py-1 rounded-lg font-bold font-cairo">
                السورة {surah.id}
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                  surah.revelation_type === 'مكية'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                }`}
              >
                {surah.revelation_type}
              </span>
              <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1 rounded-lg font-medium">
                {surah.verses_count} آية
              </span>
              <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs px-2.5 py-1 rounded-lg font-medium">
                الجزء {surah.juz_start}
              </span>
            </div>

            <h2 className="font-amiri font-bold text-3xl sm:text-4xl text-slate-900 dark:text-amber-100">
              سورة {surah.name_ar}
            </h2>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenQuickWird}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-sm font-semibold transition-all shadow-sm active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>قبل قراءة الورْد</span>
            </button>

            <button
              onClick={onOpenReflection}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-sm font-semibold transition-all shadow-sm active:scale-95"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>تدبر وعمل</span>
            </button>

            <button
              onClick={() => toggleBookmark(surah.id)}
              className={`p-2.5 rounded-xl border transition-colors ${
                bookmarked
                  ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950 dark:border-amber-700 dark:text-amber-300'
                  : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
              }`}
              title={bookmarked ? 'إزالة العلامة' : 'إضافة علامة للمرجعية'}
            >
              <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-amber-600' : ''}`} />
            </button>

            <button
              onClick={handleCopySummary}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 transition-colors"
              title="مشاركة خلاصة السورة"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs for 8 Axes */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-amber-800 text-white dark:bg-amber-600'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          المحاور الثمانية كاملة
        </button>
        <button
          onClick={() => setActiveTab('themes')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'themes'
              ? 'bg-amber-800 text-white dark:bg-amber-600'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          المحور الرئيسي والفضائل
        </button>
        <button
          onClick={() => setActiveTab('topics')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'topics'
              ? 'bg-amber-800 text-white dark:bg-amber-600'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          مواضيع الآيات
        </button>
        <button
          onClick={() => setActiveTab('gems')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'gems'
              ? 'bg-amber-800 text-white dark:bg-amber-600'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          فوائد ولطائف
        </button>
      </div>

      {/* Axis 6: Central Theme (المحور الرئيسي والمقصد العام) - Highlight Card */}
      {(activeTab === 'all' || activeTab === 'themes') && (
        <section className="bg-amber-800/10 dark:bg-amber-500/10 p-5 sm:p-6 rounded-2xl border border-amber-800/20 dark:border-amber-500/20 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-lg">
            <Compass className="w-5 h-5" />
            <h3>المحور الرئيسي والمقصد العام (المحور 6)</h3>
          </div>
          <p className="text-slate-800 dark:text-slate-100 text-lg leading-relaxed font-medium">
            {surah.central_theme}
          </p>
        </section>
      )}

      {/* Axis 1 & Axis 2: Names & Naming Reason */}
      {(activeTab === 'all' || activeTab === 'themes') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Axis 1: Other Names */}
          <section className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-400 font-bold text-base">
              <BookOpen className="w-5 h-5" />
              <h3>أسماء السورة (المحور 1)</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 px-3 py-1 rounded-lg text-sm font-semibold">
                {surah.name_ar}
              </span>
              {surah.other_names && surah.other_names.length > 0 ? (
                surah.other_names.map((name, i) => (
                  <span
                    key={i}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg text-sm"
                  >
                    {name}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 text-sm">تنفرد باسمها المشهور</span>
              )}
            </div>
          </section>

          {/* Axis 2: Naming Reason */}
          <section className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-400 font-bold text-base">
              <HelpCircle className="w-5 h-5" />
              <h3>مناسبة التسمية (المحور 2)</h3>
            </div>
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
              {surah.naming_reason || 'سميت بهذا الاسم المبارك للإشارة إلى المقصد البارز فيها.'}
            </p>
          </section>
        </div>
      )}

      {/* Axis 4: Authentic Virtues (فضائل السورة) */}
      {(activeTab === 'all' || activeTab === 'themes') && surah.virtues && surah.virtues.length > 0 && (
        <section className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-400 font-bold text-lg">
            <Award className="w-5 h-5 text-amber-600" />
            <h3>فضائل السورة وأحاديثها الصحيحة (المحور 4)</h3>
          </div>
          <div className="space-y-3">
            {surah.virtues.map((v, idx) => (
              <div
                key={idx}
                className="bg-amber-900/5 dark:bg-slate-800/60 p-4 rounded-xl border-r-4 border-amber-600 space-y-1"
              >
                <p className="font-amiri text-lg text-slate-800 dark:text-slate-100 leading-relaxed">
                  {v.text}
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-400 font-semibold text-left">
                  — {v.source}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Axis 5: First-Last Harmony (موافقة أول السورة لآخرها) */}
      {(activeTab === 'all' || activeTab === 'themes') && (
        <section className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-400 font-bold text-lg">
            <GitCommit className="w-5 h-5 text-indigo-600" />
            <h3>موافقة أول السورة لآخرها (المحور 5)</h3>
          </div>

          {surah.first_last_harmony ? (
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base">
              {surah.first_last_harmony}
            </p>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-slate-500 dark:text-slate-400 text-xs">
              <Info className="w-4 h-4 text-amber-600" />
              <span>ملاحظة منهجية: هذا المحور يقل التعبير عنه خصيصاً من سورة الملك (67) فما بعدها لقصر السور.</span>
            </div>
          )}
        </section>
      )}

      {/* Axis 7: Thematic Topics breakdown (مواضيع السورة) */}
      {(activeTab === 'all' || activeTab === 'topics') && (
        <section className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-400 font-bold text-lg">
              <ListOrdered className="w-5 h-5 text-emerald-600" />
              <h3>مواضيع السورة وتفصيل الآيات (المحور 7)</h3>
            </div>
          </div>

          {surah.thematic_topics && surah.thematic_topics.length > 0 ? (
            <div className="space-y-3">
              {surah.thematic_topics.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800"
                >
                  <span className="w-7 h-7 rounded-lg bg-emerald-800/10 text-emerald-800 dark:bg-emerald-400/20 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-slate-800 dark:text-slate-200 font-medium text-base">
                      {item.topic}
                    </p>
                    <span className="inline-block mt-1 text-xs font-semibold text-amber-800 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950/70 px-2.5 py-0.5 rounded-md">
                      الآيات: {item.verses_range}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-slate-500 dark:text-slate-400 text-xs">
              <Info className="w-4 h-4 text-amber-600" />
              <span>ملاحظة منهجية: السور القصيرة ابتداءً من سورة البلد (90) تتمركز حول موضوع واحد شامل دون تقسيم تفصيلي.</span>
            </div>
          )}
        </section>
      )}

      {/* Axis 8: Spiritual Gems & Takeaways (فوائد ولطائف) */}
      {(activeTab === 'all' || activeTab === 'gems') && surah.benefits_and_gems && surah.benefits_and_gems.length > 0 && (
        <section className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-400 font-bold text-lg">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3>فوائد ولطائف إيمانية وتربوية (المحور 8)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {surah.benefits_and_gems.map((gem, i) => (
              <div
                key={i}
                className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-1"
              >
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold text-base">•</span>
                  <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed">
                    {gem}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
