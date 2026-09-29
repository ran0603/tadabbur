import React from 'react';
import { Surah } from '../types/quran';
import { Bookmark, ChevronLeft, Sparkles, BookOpen } from 'lucide-react';
import { useReflectionStore } from '../stores/useReflectionStore';

interface SurahCardProps {
  surah: Surah;
  isSelected: boolean;
  onSelect: () => void;
  onQuickWird: () => void;
}

export const SurahCard: React.FC<SurahCardProps> = ({ surah, isSelected, onSelect, onQuickWird }) => {
  const { isBookmarked, toggleBookmark } = useReflectionStore();
  const bookmarked = isBookmarked(surah.id);

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer border ${
        isSelected
          ? 'bg-amber-500/10 border-amber-600/60 dark:bg-amber-500/15 dark:border-amber-500/50 shadow-md ring-2 ring-amber-600/20'
          : 'bg-white dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 hover:border-amber-700/40 dark:hover:border-amber-600/40 hover:shadow-md'
      }`}
    >
      {/* Header Info Bar */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {/* Surah Number Badge */}
          <div className="w-9 h-9 rounded-xl bg-amber-800/10 dark:bg-amber-400/10 text-amber-900 dark:text-amber-300 font-bold font-cairo text-sm flex items-center justify-center border border-amber-800/20 dark:border-amber-400/20">
            {surah.id}
          </div>

          <div>
            {/* Surah Arabic Name */}
            <h3 className="font-amiri font-bold text-xl text-slate-900 dark:text-amber-100 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
              سورة {surah.name_ar}
            </h3>

            {/* Revelation & Verses info */}
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span
                className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
                  surah.revelation_type === 'مكية'
                    ? 'bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-indigo-100/70 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                }`}
              >
                {surah.revelation_type}
              </span>
              <span>• {surah.verses_count} آية</span>
              <span>• الجزء {surah.juz_start}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* Bookmark toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(surah.id);
            }}
            className={`p-2 rounded-lg transition-colors ${
              bookmarked
                ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={bookmarked ? 'إزالة العلامة' : 'إضافة علامة للمرجعية'}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-amber-600' : ''}`} />
          </button>

          {/* Quick Wird launcher button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickWird();
            }}
            className="p-2 rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-100/60 dark:hover:bg-amber-950/40 transition-colors"
            title="قبل قراءة الورْد"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Central Theme Snippet */}
      <div className="mt-2 bg-amber-900/5 dark:bg-slate-800/50 p-3 rounded-xl border border-amber-900/5 dark:border-slate-800/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
        <span className="font-semibold text-amber-900 dark:text-amber-400">المحور: </span>
        {surah.central_theme}
      </div>

      {/* Footer Indicator */}
      <div className="mt-3 flex items-center justify-between text-xs text-amber-800 dark:text-amber-400 font-medium">
        <span className="flex items-center gap-1 group-hover:translate-x-[-2px] transition-transform">
          تصفح المحاور والفوائد الثمانية
          <ChevronLeft className="w-3.5 h-3.5" />
        </span>
        {surah.virtues && surah.virtues.length > 0 && (
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {surah.virtues.length} أحاديث فضائل
          </span>
        )}
      </div>
    </div>
  );
};
