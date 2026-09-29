import React, { useState } from 'react';
import { useSettingsStore, AppTheme, FontSizeScale } from '../stores/useSettingsStore';
import { useReflectionStore } from '../stores/useReflectionStore';
import { isSupabaseConfigured } from '../lib/supabase';
import { Settings, RefreshCw, Database, Sun, Moon, Type, Shield, HardDrive, CheckCircle2, Copy, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { theme, setTheme, fontSize, setFontSize, dailyWirdTarget, setDailyWirdTarget, showDailyMottoBanner, setShowDailyMottoBanner } = useSettingsStore();
  const { syncData, isSyncing, reflections, bookmarks } = useReflectionStore();
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [copiedSql, setCopiedSql] = useState(false);

  const handleManualSync = async () => {
    const res = await syncData();
    if (res.error) {
      setSyncStatus(`خطأ في المزامنة: ${res.error}`);
    } else {
      setSyncStatus(`تمت مزامنة ${res.count} عنصر محلي بنجاح مع السحابة!`);
    }
  };

  const sqlSchema = `-- 1. Surahs Metadata & Core Content
CREATE TABLE surahs (
  id INT PRIMARY KEY,
  name_ar TEXT NOT NULL,
  other_names JSONB DEFAULT '[]',
  naming_reason TEXT,
  revelation_type TEXT CHECK (revelation_type IN ('مكية', 'مدنية')),
  verses_count INT NOT NULL,
  virtues JSONB DEFAULT '[]',
  first_last_harmony TEXT,
  central_theme TEXT NOT NULL,
  thematic_topics JSONB DEFAULT '[]',
  benefits_and_gems JSONB DEFAULT '[]',
  juz_start INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Profiles & Reading Progress
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  daily_wird_target INT DEFAULT 1,
  last_active_surah INT DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Personal Reflections (تدبر وعمل)
CREATE TABLE user_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  surah_id INT REFERENCES surahs(id),
  verse_reference TEXT,
  reflection_text TEXT NOT NULL,
  action_item TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT TRUE
);

-- RLS Security Policies
ALTER TABLE user_reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own reflections" ON user_reflections
  FOR ALL USING (auth.uid() = user_id);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-2xl">
          <Settings className="w-7 h-7 text-amber-700" />
          <h2>الإعدادات والمزامنة السحابية</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          تخصيص تجربة القراءة، الخطوط، الأهداف اليومية، والمزامنة السحابية (Supabase & Dexie.js).
        </p>
      </div>

      {/* Target & Reading Goal */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-amber-100 text-lg flex items-center gap-2">
          <Database className="w-5 h-5 text-amber-600" />
          هدف الورد اليومي
        </h3>

        <div className="flex items-center gap-4">
          <label className="text-sm text-slate-700 dark:text-slate-300 font-medium">
            عدد السور أو الأجزاء المخططة يومياً:
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={dailyWirdTarget}
            onChange={(e) => setDailyWirdTarget(Number(e.target.value))}
            className="w-20 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-center font-bold text-base rounded-xl p-2 focus:ring-2 focus:ring-amber-600 focus:outline-none"
          />
          <span className="text-xs text-slate-500">سورة / يوم</span>
        </div>
      </div>

      {/* Theme & Typography Settings */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-amber-100 text-lg flex items-center gap-2">
          <Type className="w-5 h-5 text-indigo-600" />
          المظهر وحجم الخط
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Theme choices */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              نمط الألوان
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme('cream')}
                className={`flex-1 p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 ${
                  theme === 'cream'
                    ? 'bg-amber-100 border-amber-600 text-amber-900'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-600" />
                <span>ورقي دافئ</span>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-amber-500 text-amber-100'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Moon className="w-4 h-4 text-amber-400" />
                <span>ليلي (OLED)</span>
              </button>
            </div>
          </div>

          {/* Font Size Choices */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              حجم النصوص
            </label>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['sm', 'md', 'lg', 'xl'] as FontSizeScale[]).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setFontSize(sz)}
                  className={`flex-1 py-2 text-xs rounded-lg font-bold transition-all ${
                    fontSize === sz
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {sz === 'sm' ? 'صغير' : sz === 'md' ? 'متوسط' : sz === 'lg' ? 'كبير' : 'ضخم'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Offline Storage Status & Supabase Cloud Sync */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-amber-100 text-lg flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-emerald-600" />
          قاعدة البيانات المحلية (Dexie.js / IndexedDB)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 block">التأملات والالتزامات المحلية:</span>
            <span className="font-bold text-xl text-slate-900 dark:text-slate-100 mt-1 block">
              {reflections.length} تأمل
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 block">العلامات المرجعية (Bookmarks):</span>
            <span className="font-bold text-xl text-slate-900 dark:text-slate-100 mt-1 block">
              {bookmarks.length} علامة
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              حالة الربط بالسحابة (Supabase):
            </span>
            <span className="text-xs text-slate-500">
              {isSupabaseConfigured
                ? 'مفعل ومستعد للمزامنة'
                : 'يعمل محلياً بالكامل (IndexedDB) - يمكنك إضافة مفاتيح VITE_SUPABASE_URL لاحقاً'}
            </span>
          </div>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>مزامنة التأملات الآن</span>
          </button>
        </div>

        {syncStatus && (
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200">
            {syncStatus}
          </p>
        )}
      </div>

      {/* Supabase PostgreSQL Schema Export */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-amber-100 text-base flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-600" />
            مخطط قاعدة بيانات PostgreSQL (Supabase DDL & RLS)
          </h3>
          <button
            onClick={copySql}
            className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950 px-3 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSql ? 'تم النسخ!' : 'نسخ كود SQL'}</span>
          </button>
        </div>

        <pre className="bg-slate-950 text-slate-100 text-[11px] font-mono p-4 rounded-2xl overflow-x-auto max-h-56 no-scrollbar leading-relaxed" dir="ltr">
          {sqlSchema}
        </pre>
      </div>
    </div>
  );
};
