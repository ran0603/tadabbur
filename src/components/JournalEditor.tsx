import React, { useState } from 'react';
import { Surah, LocalReflection } from '../types/quran';
import { useReflectionStore } from '../stores/useReflectionStore';
import { Heart, Save, Trash2, Download, RefreshCw, CheckCircle, Clock, AlertCircle, Plus, X } from 'lucide-react';

interface JournalEditorProps {
  surah?: Surah;
  allSurahs: Surah[];
  isOpen: boolean;
  onClose: () => void;
}

export const JournalEditor: React.FC<JournalEditorProps> = ({ surah, allSurahs, isOpen, onClose }) => {
  const { reflections, addReflection, deleteReflection, syncData, isSyncing } = useReflectionStore();
  const [selectedSurahId, setSelectedSurahId] = useState<number>(surah?.id || 1);
  const [verseRef, setVerseRef] = useState<string>('');
  const [reflectionText, setReflectionText] = useState<string>('');
  const [actionItem, setActionItem] = useState<string>('');
  const [syncFeedback, setSyncFeedback] = useState<string>('');

  if (!isOpen) return null;

  const currentSurah = allSurahs.find((s) => s.id === selectedSurahId) || allSurahs[0];
  const surahReflections = reflections.filter((r) => r.surah_id === selectedSurahId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionText.trim()) return;

    await addReflection(selectedSurahId, reflectionText, actionItem, verseRef);
    setReflectionText('');
    setActionItem('');
    setVerseRef('');
  };

  const handleExportMarkdown = () => {
    let content = `# دفتر تدبر القرآن الكريـم (تدبر وعمل)\n\n`;
    content += `تاريخ التصدير: ${new Date().toLocaleDateString('ar-EG')}\n\n`;

    reflections.forEach((ref) => {
      const s = allSurahs.find((item) => item.id === ref.surah_id);
      content += `## سورة ${s?.name_ar || ref.surah_id} ${ref.verse_reference ? `(الآية ${ref.verse_reference})` : ''}\n`;
      content += `**التأمل الإيماني:**\n${ref.reflection_text}\n\n`;
      if (ref.action_item) {
        content += `**الالتزام العملي (سر القرآن العمل به):**\n${ref.action_item}\n\n`;
      }
      content += `---\n\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تدبر_وعمل_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
  };

  const handleManualSync = async () => {
    const res = await syncData();
    if (res.error) {
      setSyncFeedback(res.error);
    } else {
      setSyncFeedback(`تمت مزامنة ${res.count} تأمل مع السحابة بنجاح!`);
    }
    setTimeout(() => setSyncFeedback(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FDFBF7] dark:bg-[#1A1A1A] w-full max-w-4xl rounded-3xl shadow-2xl border border-rose-900/20 dark:border-slate-800 max-h-[90vh] overflow-y-auto no-scrollbar relative flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-[#FDFBF7]/95 dark:bg-[#1A1A1A]/95 backdrop-blur-md p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-700 text-white flex items-center justify-center shadow-md">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h2 className="font-amiri font-bold text-2xl text-slate-900 dark:text-rose-100">
                تدبر وعمل (دفتر التأملات والالتزامات)
              </h2>
              <p className="text-xs text-rose-800/80 dark:text-rose-400">
                ﴿سر القرآن هو العمل به﴾ - دوّن تأملاتك والتزاماتك العملية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
              title="تصدير التأملات كملف Markdown"
            >
              <Download className="w-4 h-4" />
              <span>تصدير</span>
            </button>

            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              title="مزامنة مع السحابة (Supabase)"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>مزامنة</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Sync feedback toast */}
        {syncFeedback && (
          <div className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 p-3 text-xs text-center font-medium border-b border-amber-200">
            {syncFeedback}
          </div>
        )}

        {/* Content */}
        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          {/* Left / New Reflection Form */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-amber-100 text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-600" />
                إضافة تأمل والتزام جديد
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Surah Select & Verse Ref */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      السورة
                    </label>
                    <select
                      value={selectedSurahId}
                      onChange={(e) => setSelectedSurahId(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-rose-600 focus:outline-none"
                    >
                      {allSurahs.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.id}. سورة {s.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      رقم الآية (اختياري)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: الآية 15"
                      value={verseRef}
                      onChange={(e) => setVerseRef(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-rose-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Reflection Text */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    التأمل الإيماني أو الفائدة التي استوقفتك *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="ما الأثر الذي أحدثته الآية في قلبك؟"
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-xl p-3 focus:ring-2 focus:ring-rose-600 focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Action Item Commitment */}
                <div>
                  <label className="block text-xs font-semibold text-rose-700 dark:text-rose-400 mb-1">
                    الالتزام العملي (ما التطبيق والسلوك اليومي؟)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: سأحافظ على الاستغفار بالأسحار هذا الأسبوع"
                    value={actionItem}
                    onChange={(e) => setActionItem(e.target.value)}
                    className="w-full bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-slate-800 dark:text-slate-100 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-rose-600 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  حفظ التأمل محلياً (IndexedDB)
                </button>
              </form>
            </div>
          </div>

          {/* Right / Saved Reflections List */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-amber-100 text-base flex items-center justify-between">
              <span>تأملات سورة {currentSurah.name_ar}</span>
              <span className="text-xs text-slate-500 font-normal">
                الإجمالي: {surahReflections.length}
              </span>
            </h3>

            {surahReflections.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <Heart className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">لا توجد تأملات مسجلة لهذه السورة بعد.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[450px] overflow-y-auto no-scrollbar pr-1">
                {surahReflections.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 relative group"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-rose-700 dark:text-rose-400">
                        {item.verse_reference ? `الآية: ${item.verse_reference}` : 'تأمل عام بالسورة'}
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Sync Status Badge */}
                        <span
                          className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            item.is_synced === 1
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                          title={item.is_synced === 1 ? 'متحقق بالسحابة' : 'محفوظ محلياً فقط'}
                        >
                          {item.is_synced === 1 ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {item.is_synced === 1 ? 'مُتزامن' : 'محلي'}
                        </span>

                        <button
                          onClick={() => deleteReflection(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="حذف التأمل"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed">
                      {item.reflection_text}
                    </p>

                    {item.action_item && (
                      <div className="bg-rose-50/70 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200/60 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200 font-medium">
                        <span className="font-bold">الالتزام العملي: </span>
                        {item.action_item}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
