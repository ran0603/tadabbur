import React, { useState } from 'react';
import { Surah } from '../types/quran';
import { Sparkles, Clock, CheckCircle2, Circle, X, BookOpen, Compass, GitCommit } from 'lucide-react';

interface QuickWirdModalProps {
  surah: Surah;
  isOpen: boolean;
  onClose: () => void;
  onSelectSurah?: (surahId: number) => void;
  allSurahs: Surah[];
}

export const QuickWirdModal: React.FC<QuickWirdModalProps> = ({
  surah,
  isOpen,
  onClose,
  onSelectSurah,
  allSurahs,
}) => {
  const [completedTopics, setCompletedTopics] = useState<Record<number, boolean>>({});

  if (!isOpen) return null;

  const toggleTopic = (index: number) => {
    setCompletedTopics((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FDFBF7] dark:bg-[#1A1A1A] w-full max-w-2xl rounded-3xl shadow-2xl border border-amber-800/20 dark:border-slate-800 max-h-[90vh] overflow-y-auto no-scrollbar relative flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 bg-[#FDFBF7]/95 dark:bg-[#1A1A1A]/95 backdrop-blur-md p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-700 text-white flex items-center justify-center font-amiri font-bold text-xl shadow-md">
              {surah.id}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs px-2 py-0.5 rounded-md font-semibold">
                  وضع قبل الورْد
                </span>
                <span className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  قراءة سريعة (2–3 دقائق)
                </span>
              </div>
              <h2 className="font-amiri font-bold text-2xl text-slate-900 dark:text-amber-100 mt-0.5">
                سورة {surah.name_ar}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 sm:p-6 space-y-6 flex-1">
          {/* Quick Surah Picker inside modal */}
          {onSelectSurah && (
            <div className="flex items-center justify-between bg-amber-900/5 dark:bg-slate-800/50 p-3 rounded-xl border border-amber-900/10 dark:border-slate-800">
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">اختر سورة أخرى للورْد:</span>
              <select
                value={surah.id}
                onChange={(e) => onSelectSurah(Number(e.target.value))}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-600"
              >
                {allSurahs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id}. سورة {s.name_ar} ({s.revelation_type})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 1. Central Theme Highlight Card */}
          <div className="bg-amber-800/10 dark:bg-amber-500/15 p-5 rounded-2xl border border-amber-800/20 dark:border-amber-500/20 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-base">
              <Compass className="w-5 h-5 text-amber-700" />
              <h3>1. المحور الرئيسي والمقصد العام</h3>
            </div>
            <p className="text-slate-800 dark:text-slate-100 text-base leading-relaxed font-medium">
              {surah.central_theme}
            </p>
          </div>

          {/* 2. Structural Harmony Card */}
          {surah.first_last_harmony && (
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-bold text-base">
                <GitCommit className="w-5 h-5 text-indigo-600" />
                <h3>2. موافقة أول السورة لآخرها</h3>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                {surah.first_last_harmony}
              </p>
            </div>
          )}

          {/* 3. Interactive Sequential Topics Checklist */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-base">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <h3>3. مواضيع السورة وتسلسل التلاوة</h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                علم عليها أثناء قراءة الورْد
              </span>
            </div>

            {surah.thematic_topics && surah.thematic_topics.length > 0 ? (
              <div className="space-y-2.5">
                {surah.thematic_topics.map((topic, idx) => {
                  const isChecked = !!completedTopics[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleTopic(idx)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 line-through opacity-80'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <button className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400">
                        {isChecked ? (
                          <CheckCircle2 className="w-5 h-5 fill-emerald-600 text-white" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{topic.topic}</p>
                        <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold block mt-0.5">
                          الآيات: {topic.verses_range}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                سورة قصيرة تركز على مقصد إيماني واحد محوري.
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-[#FDFBF7] dark:bg-[#1A1A1A] p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            أنت الآن جاهز لفتح المصحف وبدء التلاوة بقلب متدبر!
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            إغلاق والانتقال للتلاوة
          </button>
        </div>
      </div>
    </div>
  );
};
