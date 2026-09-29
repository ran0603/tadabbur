import React, { useState, useEffect } from 'react';
import { BookOpen, Sun, Moon, Type, Download, Wifi, WifiOff, Sparkles, Bookmark, Heart, Layers } from 'lucide-react';
import { useSettingsStore, FontSizeScale, AppTheme } from '../stores/useSettingsStore';
import { useReflectionStore } from '../stores/useReflectionStore';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickWird: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenQuickWird }) => {
  const { theme, setTheme, fontSize, setFontSize } = useSettingsStore();
  const { bookmarks, reflections } = useReflectionStore();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const fontSizes: { label: string; value: FontSizeScale }[] = [
    { label: 'صغير', value: 'sm' },
    { label: 'متوسط', value: 'md' },
    { label: 'كبير', value: 'lg' },
    { label: 'كبير جداً', value: 'xl' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/90 dark:bg-[#121212]/90 backdrop-blur-md border-b border-amber-900/10 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('surahs')}>
            <div className="w-10 h-10 rounded-xl bg-amber-800 dark:bg-amber-600 text-amber-50 flex items-center justify-center shadow-md font-amiri font-bold text-xl">
              أ
            </div>
            <div>
              <h1 className="font-amiri font-bold text-lg sm:text-xl text-slate-900 dark:text-amber-100 flex items-center gap-2">
                أول مرة أتدبر القرآن
              </h1>
              <p className="text-xs text-amber-800/80 dark:text-amber-400/80 hidden sm:block">
                دليل تدبر الورد اليومي ومقاصد السور
              </p>
            </div>
          </div>

          {/* Controls & Badges */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Before Wird Quick Action Button */}
            <button
              onClick={onOpenQuickWird}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95"
              title="وضع قبل قراءة الورْد"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span className="hidden xs:inline">قبل الورْد</span>
            </button>

            {/* Font Scaling Controls */}
            <div className="hidden md:flex items-center bg-slate-200/60 dark:bg-slate-800/80 rounded-lg p-0.5 border border-slate-300/50 dark:border-slate-700">
              {fontSizes.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFontSize(item.value)}
                  className={`px-2 py-1 text-xs rounded-md transition-colors font-medium ${
                    fontSize === item.value
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'cream' : 'dark')}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-amber-900/10 dark:hover:bg-slate-800 transition-colors"
              title={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>

            {/* Network Status Badge */}
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
              }`}
              title={isOnline ? 'متصل بالشبكة - الوضع التلقائي' : 'يعمل بدون اتصال (Offline)'}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />}
              <span className="hidden sm:inline">{isOnline ? 'أونلاين' : 'بدون إنترنت'}</span>
            </div>

            {/* PWA Install Button if prompt available */}
            {deferredPrompt && (
              <button
                onClick={handleInstallPWA}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">تثبيت التطبيق</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 border-t border-slate-200 dark:border-slate-800 py-1 overflow-x-auto no-scrollbar text-sm">
          <button
            onClick={() => setActiveTab('surahs')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'surahs'
                ? 'bg-amber-800/10 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>السور والمحاور</span>
          </button>

          <button
            onClick={() => setActiveTab('wird')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'wird'
                ? 'bg-amber-800/10 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>قبل قراءة الورْد</span>
          </button>

          <button
            onClick={() => setActiveTab('journal')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-colors relative ${
              activeTab === 'journal'
                ? 'bg-amber-800/10 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>تدبر وعمل (دفتر التأملات)</span>
            {reflections.length > 0 && (
              <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                {reflections.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('enrichment')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'enrichment'
                ? 'bg-amber-800/10 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>زاد المتدبر (المجموعات والكتب)</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'settings'
                ? 'bg-amber-800/10 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Type className="w-4 h-4 text-slate-500" />
            <span>الإعدادات والمزامنة</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
