import { useState, useEffect } from 'react';
import { ErrorBoundary } from './core/errors/ErrorBoundary';
import { db } from './core/db';
import { AnalyticsConsentBanner } from './core/analytics/AnalyticsConsentBanner';
import { HomeScreen, UserState } from './features/home/HomeScreen';
import { OnboardingFlow } from './features/onboarding/OnboardingFlow';
import { SurahList } from './features/reader/SurahList';
import { ReaderScreen } from './features/reader/ReaderScreen';
import { TodayScreen } from './features/actions/TodayScreen';
import { JournalListScreen } from './features/journal/JournalListScreen';
import { AccountScreen } from './features/account/AccountScreen';

type Tab = 'home' | 'surahs' | 'actions' | 'journal' | 'settings';

function TadabburAppShell() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedSurahId, setSelectedSurahId] = useState<number | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [userState, setUserState] = useState<UserState>('ret');
  const [isNavExpanded, setIsNavExpanded] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    db.getSetting<boolean>('onboarding_completed').then((completed) => {
      if (mounted) {
        setShowOnboarding(completed === true ? false : true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const navigateToTab = (tab: Tab) => {
    setActiveTab(tab);
    setSelectedSurahId(null);
  };

  const handleSelectSurah = (id: number) => {
    setSelectedSurahId(id);
    setActiveTab('surahs');
  };

  if (showOnboarding === null) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="mark ar text-2xl w-10 h-10 rounded-lg">ت</div>
          <span className="serif text-xl font-bold text-[var(--ink)]">Tadabbur</span>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  const navItems: { tab: Tab; label: string; icon: string; badge?: string }[] = [
    { tab: 'home', label: 'Home', icon: '🏠' },
    { tab: 'surahs', label: 'Surahs', icon: '📖' },
    { tab: 'actions', label: 'Actions', icon: '✅', badge: userState === 'due' ? '2' : undefined },
    { tab: 'journal', label: 'Journal', icon: '✍️' },
    { tab: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col md:flex-row">
      {/* Sidebar Navigation (tablet & desktop) */}
      <aside className={`hidden md:flex side sticky top-0 h-screen flex-col py-6 transition-all duration-300 border-r border-[var(--line)] bg-[var(--surf)] ${isNavExpanded ? 'w-64 px-4' : 'w-20 items-center px-0 rail'}`}>
        <div className={`flex items-center w-full ${isNavExpanded ? 'justify-between mb-6 px-2' : 'flex-col justify-center gap-4 mb-6'}`}>
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigateToTab('home')}
          >
            <div className="mark ar text-xl w-9 h-9 rounded-lg flex items-center justify-center">ت</div>
            {isNavExpanded && <b className="serif text-xl text-[var(--ink)]">Tadabbur</b>}
          </div>
          <button 
            onClick={() => setIsNavExpanded(!isNavExpanded)}
            className="text-[var(--mut)] hover:text-[var(--pri)] p-1 rounded-md"
            title={isNavExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isNavExpanded ? '◀' : '▶'}
          </button>
        </div>

        <nav className={`flex flex-col gap-1 w-full ${!isNavExpanded && 'px-1 gap-2'}`}>
          {navItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => navigateToTab(item.tab)}
              className={`n ${activeTab === item.tab && selectedSurahId === null ? 'on' : ''}`}
              title={!isNavExpanded ? item.label : undefined}
            >
              <span className="text-base">{item.icon}</span>
              {isNavExpanded ? (
                <>
                  <span>{item.label}</span>
                  {item.badge && <em>{item.badge}</em>}
                </>
              ) : (
                <span className="text-[0.6rem] mt-1 relative">
                  {item.label}
                  {item.badge && <span className="absolute -top-3 -right-2 bg-[var(--gold)] text-[#12302F] font-bold rounded-full w-4 h-4 flex items-center justify-center text-[9px]">{item.badge}</span>}
                </span>
              )}
            </button>
          ))}
        </nav>

        {isNavExpanded ? (
          <div className="mt-auto pt-4 border-t border-[var(--line)] px-2">
            <button
              onClick={() => setShowOnboarding(true)}
              className="text-xs text-[var(--mut)] hover:text-[var(--pri)] transition-colors flex items-center gap-1.5"
            >
              <span>🔄</span> View Onboarding Guide
            </button>
          </div>
        ) : (
          <div className="mt-auto pt-4 border-t border-[var(--line)] w-full flex justify-center">
            <button
              onClick={() => setShowOnboarding(true)}
              className="text-lg text-[var(--mut)] hover:text-[var(--pri)] transition-colors p-2"
              title="View Onboarding Guide"
            >
              🔄
            </button>
          </div>
        )}
      </aside>

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col min-h-screen pb-20 md:pb-6">
        {/* Mobile Header */}
        <header className="flex md:hidden border-b border-[var(--line)] bg-[var(--surf)] px-4 py-3 items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2" onClick={() => navigateToTab('home')}>
            <div className="mark ar text-sm w-7 h-7 rounded flex items-center justify-center">ت</div>
            <span className="serif text-lg font-bold text-[var(--ink)]">Tadabbur</span>
          </div>
          <button
            onClick={() => setShowOnboarding(true)}
            className="text-xs text-[var(--pri)] font-medium"
          >
            Onboarding
          </button>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {activeTab === 'home' && selectedSurahId === null ? (
            <HomeScreen
              onSelectSurah={handleSelectSurah}
              onOpenActions={() => navigateToTab('actions')}
              onOpenJournal={() => navigateToTab('journal')}
              onStateChange={(st) => setUserState(st)}
            />
          ) : activeTab === 'actions' ? (
            <TodayScreen onBrowseSurahs={() => navigateToTab('surahs')} />
          ) : activeTab === 'journal' ? (
            <JournalListScreen onBrowseSurahs={() => navigateToTab('surahs')} />
          ) : activeTab === 'settings' ? (
            <div className="space-y-6">
              <AccountScreen />
              <div className="card p-4 flex items-center justify-between">
                <div>
                  <b className="block text-sm">Onboarding Setup</b>
                  <span className="text-xs mut">Re-run the initial 4-step onboarding flow</span>
                </div>
                <button className="btn" onClick={() => setShowOnboarding(true)}>
                  Start Onboarding
                </button>
              </div>
            </div>
          ) : selectedSurahId === null ? (
            <div className="space-y-6">
              <div className="card p-6">
                <h1 className="text-xl font-serif font-bold text-[var(--ink)] mb-1">
                  Mushaf Reader
                </h1>
                <p className="text-xs mut">
                  Read Quranic Surahs in thematic blocks, write encrypted reflections, and take micro-actions.
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

        <AnalyticsConsentBanner />
      </div>

      {/* Mobile Bottom Tabbar Navigation */}
      <nav className="flex md:hidden tabbar fixed bottom-0 left-0 right-0 z-30 shadow-lg">
        {navItems.map((item) => (
          <button
            key={item.tab}
            onClick={() => navigateToTab(item.tab)}
            className={activeTab === item.tab && selectedSurahId === null ? 'on' : ''}
          >
            <span className="block text-lg mb-0.5 relative">
              {item.icon}
              {item.badge && <span className="absolute -top-1 -right-2 bg-[var(--gold)] text-[#12302F] text-[9px] font-bold rounded-full px-1">●</span>}
            </span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <TadabburAppShell />
    </ErrorBoundary>
  );
}
