import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppTheme = 'cream' | 'dark' | 'slate';
export type FontSizeScale = 'sm' | 'md' | 'lg' | 'xl';

interface SettingsState {
  theme: AppTheme;
  fontSize: FontSizeScale;
  dailyWirdTarget: number; // Surahs or pages per day
  fontFamily: 'cairo' | 'ibm' | 'tajawal';
  showDailyMottoBanner: boolean;

  setTheme: (theme: AppTheme) => void;
  setFontSize: (size: FontSizeScale) => void;
  setDailyWirdTarget: (target: number) => void;
  setFontFamily: (font: 'cairo' | 'ibm' | 'tajawal') => void;
  setShowDailyMottoBanner: (show: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'cream',
      fontSize: 'md',
      dailyWirdTarget: 1,
      fontFamily: 'cairo',
      showDailyMottoBanner: true,

      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
      setFontSize: (fontSize) => set({ fontSize }),
      setDailyWirdTarget: (dailyWirdTarget) => set({ dailyWirdTarget }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setShowDailyMottoBanner: (showDailyMottoBanner) => set({ showDailyMottoBanner }),
    }),
    {
      name: 'quran-tadabbur-settings',
    }
  )
);
