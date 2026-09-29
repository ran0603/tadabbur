import { useState, useEffect } from 'react';
import { db, SurahRecord } from '../../core/db';
import { AlertBanner, AlertItem } from './AlertBanner';

export type UserState = 'new' | 'ret' | 'off' | 'due';

interface HomeScreenProps {
  onSelectSurah: (surahId: number) => void;
  onOpenActions: () => void;
  onOpenJournal: () => void;
  onStateChange?: (state: UserState) => void;
}

export function HomeScreen({
  onSelectSurah,
  onOpenActions,
  onStateChange,
}: HomeScreenProps) {
  const [userState, setUserState] = useState<UserState>('ret');
  const [surahs, setSurahs] = useState<SurahRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Marked done: 1 of 3');

  const [actions, setActions] = useState([
    { id: 'act-1', text: 'Verify one forwarded message', verseRef: 'Al-Hujurat 49:6', done: true },
    { id: 'act-2', text: "Reach out to someone you've drifted from", verseRef: 'Al-Hujurat 49:10', done: false },
    { id: 'act-3', text: 'Pray for a friend by name', verseRef: 'Al-Hashr 59:10', done: false },
  ]);

  // Sync state changes with parent shell for sidebar badge updates
  const handleStateSelect = (newState: UserState) => {
    setUserState(newState);
    setShowToast(newState === 'due');
    if (onStateChange) {
      onStateChange(newState);
    }
  };

  useEffect(() => {
    let mounted = true;
    db.getSurahs().then((loaded) => {
      if (mounted) {
        if (loaded.length > 0) {
          setSurahs(loaded);
        } else {
          const fallbackSurahs: SurahRecord[] = [
            { id: 1, nameAr: 'الفاتحة', nameEn: 'Al-Fatihah', revelationType: 'makki', verseCount: 7, textChecksum: '' },
            { id: 2, nameAr: 'البقرة', nameEn: 'Al-Baqarah', revelationType: 'madani', verseCount: 286, textChecksum: '' },
            { id: 67, nameAr: 'الملك', nameEn: 'Al-Mulk', revelationType: 'makki', verseCount: 30, textChecksum: '' },
            { id: 36, nameAr: 'يس', nameEn: 'Ya-Sin', revelationType: 'makki', verseCount: 83, textChecksum: '' },
            { id: 18, nameAr: 'الكهف', nameEn: 'Al-Kahf', revelationType: 'makki', verseCount: 110, textChecksum: '' },
            { id: 55, nameAr: 'الرحمن', nameEn: 'Ar-Rahman', revelationType: 'madani', verseCount: 78, textChecksum: '' },
          ];
          setSurahs(fallbackSurahs);
        }
      }
    });

    // Detect browser online/offline status
    const handleOffline = () => handleStateSelect('off');
    const handleOnline = () => handleStateSelect('ret');
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    if (!navigator.onLine) {
      handleStateSelect('off');
    }

    return () => {
      mounted = false;
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const toggleAction = (id: string) => {
    setActions((prev) => {
      const updated = prev.map((act) => (act.id === id ? { ...act, done: !act.done } : act));
      const doneCount = updated.filter((a) => a.done).length;
      setToastMessage(`Marked done: ${doneCount} of ${updated.length}`);
      setShowToast(true);
      return updated;
    });
  };

  const completedActionsCount = actions.filter((a) => a.done).length;

  const filteredSurahs = surahs.filter(
    (s) =>
      s.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nameAr.includes(searchQuery) ||
      s.id.toString() === searchQuery.trim()
  );

  // Dynamic alerts per user state
  const getAlertsForState = (): AlertItem[] => {
    switch (userState) {
      case 'new':
        return [
          {
            id: 'alt-new-1',
            type: 'i',
            title: 'Offline pack not downloaded',
            description: 'Download once to read without a connection (102 MB).',
            actionLabel: 'Download',
            onAction: () => alert('Initiating offline pack download (102 MB)...'),
          },
        ];
      case 'ret':
        return [
          {
            id: 'alt-ret-1',
            type: 'i',
            title: 'Commentary update available',
            description: 'Ibn Kathir and Al-Qurtubi, 12 MB.',
            actionLabel: 'Update',
            onAction: () => alert('Updating commentaries (12 MB)...'),
          },
        ];
      case 'off':
        return [
          {
            id: 'alt-off-1',
            type: 'w',
            title: "You're offline",
            description: 'Downloaded text and commentary still work. Updates resume when you reconnect.',
          },
          {
            id: 'alt-off-2',
            type: 'e',
            title: 'Audio unavailable',
            description: 'Mishary Alafasy is not downloaded.',
            actionLabel: 'Manage',
            onAction: () => alert('Opening Audio Pack settings...'),
          },
        ];
      case 'due':
        return [
          {
            id: 'alt-due-1',
            type: 'w',
            title: "You missed yesterday's action",
            description: 'No pressure. Pick it up today or pause it.',
            actionLabel: 'Review',
            onAction: onOpenActions,
          },
          {
            id: 'alt-due-2',
            type: 'i',
            title: 'Reminders are off',
            description: 'Notifications are denied. Turn them on in Settings.',
            actionLabel: 'Settings',
            onAction: () => alert('Opening Notification Settings...'),
          },
        ];
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="mut text-sm">Assalamu alaykum</div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[var(--ink)]">
            {userState === 'new' ? "Let's begin your first Surah" : "Ready for tonight's reflection?"}
          </h1>
        </div>

        <div className="w-full lg:w-96">
          <div className="search">
            <svg className="w-4 h-4 text-[var(--mut)] flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search a Surah, theme or verse"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-sm text-[var(--ink)] placeholder-[var(--mut)]"
            />
          </div>
        </div>
      </div>

      {/* Alert Banners */}
      <AlertBanner alerts={getAlertsForState()} />

      {/* Main Responsive Grid Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6 items-start">
        {/* Column 1: Hero Banner + Browse Surahs Grid */}
        <div className="xl:col-span-6 space-y-6">
          {/* Hero Banner */}
          {userState === 'new' ? (
            <div className="hero pat shadow-md relative overflow-hidden">
              <div className="sm text-white/75">Start here</div>
              <div className="ar text-3xl sm:text-4xl text-[var(--gold)] my-2">سورة الفاتحة</div>
              <h3 className="text-xl font-serif font-semibold text-white">Al-Fatihah, 7 verses</h3>
              <div className="sm text-white/80 mt-1 mb-5">
                A 2-minute orientation, then read it as one passage.
              </div>
              <button className="btn" onClick={() => onSelectSurah(1)}>
                Begin orientation
              </button>
            </div>
          ) : (
            <div className="hero pat shadow-md relative overflow-hidden">
              <div className="sm text-white/75">
                Continue where you left off
                {userState === 'off' && <b className="font-semibold ml-1">&bull; Available offline</b>}
              </div>
              <div className="ar text-3xl sm:text-4xl text-[var(--gold)] my-2">سورة الحجرات</div>
              <h3 className="text-xl font-serif font-semibold text-white">Al-Hujurat, verses 6 to 10</h3>
              <div className="sm text-white/80 mt-1 mb-5">
                Verifying news and making peace. Passage 2 of 3.
              </div>
              <button className="btn" onClick={() => onSelectSurah(49)}>
                Continue reading
              </button>
            </div>
          )}

          {/* Browse Surahs Grid */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-serif font-semibold text-[var(--ink)]">Browse Surahs</h3>
              <span className="sm font-semibold text-[var(--pri)] cursor-pointer" onClick={() => onSelectSurah(1)}>
                All 114
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredSurahs.slice(0, 6).map((s) => (
                <div
                  key={s.id}
                  onClick={() => onSelectSurah(s.id)}
                  className="card p-3 cursor-pointer hover:border-[var(--pri)] transition-all hover:shadow-sm"
                >
                  <div className="ar text-xl text-right text-[var(--ink)] mb-1">{s.nameAr}</div>
                  <b className="sm block text-[var(--ink)] truncate">{s.nameEn}</b>
                  <div className="mut text-[11px]">
                    {s.revelationType === 'makki' ? 'Makki' : 'Madani'} &bull; {s.verseCount} verses
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: Secondary Card (Actions / Latest Reflection) + Reflection Week */}
        <div className="xl:col-span-3 space-y-6">
          {/* Secondary Center Card */}
          {userState === 'due' ? (
            <div className="card space-y-3">
              <div className="flex justify-between items-center pb-1">
                <h3 className="text-lg font-serif font-semibold text-[var(--ink)]">Today's actions</h3>
                <span className="chip cursor-pointer" onClick={onOpenActions}>
                  {completedActionsCount} of {actions.length} done
                </span>
              </div>

              <div className="space-y-1">
                {actions.map((act) => (
                  <div key={act.id} className="li cursor-pointer" onClick={() => toggleAction(act.id)}>
                    <div className={`ck ${act.done ? 'd' : ''}`}>{act.done ? '✓' : ''}</div>
                    <div className="flex-1">
                      <b className={`text-xs sm:text-sm font-medium ${act.done ? 'line-through opacity-60' : ''}`}>
                        {act.text}
                      </b>
                      <div className="mut text-[11px]">{act.verseRef}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : userState === 'new' ? (
            <div className="card text-center py-6 px-4 space-y-3">
              <h3 className="text-lg font-serif font-semibold text-[var(--ink)]">Today's actions</h3>
              <p className="mut sm text-xs">
                Nothing yet. When a verse asks something of you, tap "Add to Action Checklist".
              </p>
              <button className="btn w-full" onClick={() => onSelectSurah(1)}>
                Explore a Surah
              </button>
            </div>
          ) : (
            /* Returning or Offline state: Latest Reflection preview card */
            <div className="card space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-serif font-semibold text-[var(--ink)]">Latest reflection</h3>
                <span className="chip">🔒 Encrypted</span>
              </div>
              <div className="mut sm text-xs font-medium">Al-Hujurat 49:6 &bull; yesterday</div>
              <p className="text-sm text-[var(--ink)] italic bg-[var(--tint)]/50 p-3 rounded-xl border border-[var(--line)]">
                "Pausing before I forward anything. Who does it hurt if it's wrong?"
              </p>
            </div>
          )}

          {/* Reflection Week Summary Card */}
          <div className="card space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-serif font-semibold text-[var(--ink)]">This week</h3>
              <span className="sm mut">
                {userState === 'new'
                  ? 'Not started'
                  : userState === 'due'
                  ? '3 days of reflection'
                  : '4 days of reflection'}
              </span>
            </div>

            <div className="wk my-2">
              {userState === 'new' ? (
                <>
                  <i title="Mon - Not started" />
                  <i title="Tue - Not started" />
                  <i title="Wed - Not started" />
                  <i title="Thu - Not started" />
                  <i title="Fri - Not started" />
                  <i title="Sat - Not started" />
                  <i title="Sun - Not started" />
                </>
              ) : userState === 'due' ? (
                <>
                  <i className="d" title="Mon - Done" />
                  <i className="d" title="Tue - Done" />
                  <i title="Wed - Missed" />
                  <i className="d" title="Thu - Done" />
                  <i className="t" title="Fri - Today" />
                  <i title="Sat - Upcoming" />
                  <i title="Sun - Upcoming" />
                </>
              ) : (
                <>
                  <i className="d" title="Mon - Done" />
                  <i className="d" title="Tue - Done" />
                  <i title="Wed - Rest" />
                  <i className="d" title="Done" />
                  <i className="d" title="Done" />
                  <i className="t" title="Today" />
                  <i title="Upcoming" />
                </>
              )}
            </div>

            <div className="sm mut text-xs">
              {userState === 'new'
                ? 'Your week begins with your first passage.'
                : 'Missing a day is fine. Pick up where you paused.'}
            </div>
          </div>
        </div>

        {/* Column 3: Surah Roadmap + Offline Status Card */}
        <div className="xl:col-span-3 space-y-6">
          {/* Surah Roadmap (visible on widescreen) */}
          <div className="card space-y-3">
            <div className="flex justify-between items-center pb-1">
              <h3 className="text-lg font-serif font-semibold text-[var(--ink)]">Surah roadmap</h3>
              <span className="text-xs mut">Al-Hujurat</span>
            </div>

            <div className="space-y-1">
              <div className="li">
                <div className="ck d">✓</div>
                <div className="flex-1">
                  <b className="text-xs sm:text-sm">Verses 1 to 5</b>
                  <div className="mut text-[11px]">Manners with the Prophet ﷺ</div>
                </div>
              </div>

              <div className="li">
                <div className="ck border-[var(--pri)] text-[var(--pri)] font-bold">●</div>
                <div className="flex-1">
                  <b className="text-xs sm:text-sm text-[var(--pri)]">Verses 6 to 10</b>
                  <div className="mut text-[11px]">Verifying news, making peace</div>
                </div>
                <span className="chip">Now</span>
              </div>

              <div className="li border-0">
                <div className="ck"></div>
                <div className="flex-1">
                  <b className="text-xs sm:text-sm">Verses 11 to 18</b>
                  <div className="mut text-[11px]">Brotherhood and sincerity</div>
                </div>
              </div>
            </div>
          </div>

          {/* Offline Status Card */}
          <div className="card space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-serif font-semibold text-[var(--ink)]">Offline status</h3>
              {userState === 'off' ? (
                <span className="chip w">Offline</span>
              ) : userState === 'new' ? (
                <span className="chip w">Not downloaded</span>
              ) : (
                <span className="chip">Works offline</span>
              )}
            </div>

            <div className="bar mt-2">
              <b style={{ width: userState === 'new' ? '0%' : userState === 'off' ? '100%' : '96%' }} />
            </div>

            <div className="sm mut text-xs mt-2">
              {userState === 'new'
                ? '0 of 102 MB'
                : userState === 'ret'
                ? 'Update pending &bull; 102 MB'
                : '102 MB downloaded'}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Toast Notification */}
      {showToast && (
        <div className="toast">
          <span className="text-sm font-medium">{toastMessage}</span>
          <button
            onClick={() => {
              setShowToast(false);
              setActions((prev) => prev.map((act) => ({ ...act, done: false })));
            }}
            className="text-sm font-bold text-[var(--gold)] cursor-pointer hover:underline"
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
