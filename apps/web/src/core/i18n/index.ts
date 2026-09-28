export interface Dictionary {
  common: {
    appName: string;
    startReading: string;
    skip: string;
    retry: string;
    save: string;
    today: string;
    library: string;
    journal: string;
    settings: string;
  };
  orientation: {
    title: string;
    typeMakki: string;
    typeMadani: string;
    verseCount: string;
    centralTheme: string;
    guidedOverviewComing: string;
  };
  actions: {
    addChecklist: string;
    completedToday: string;
    noActionsYet: string;
  };
}

export const en: Dictionary = {
  common: {
    appName: 'Tadabbur',
    startReading: 'Start reading',
    skip: 'Skip',
    retry: 'Retry',
    save: 'Save note',
    today: 'Today',
    library: 'Library',
    journal: 'Journal',
    settings: 'Settings',
  },
  orientation: {
    title: 'Surah Orientation',
    typeMakki: 'Makki',
    typeMadani: 'Madani',
    verseCount: 'Verses',
    centralTheme: 'Core Axis',
    guidedOverviewComing: 'Guided overview coming soon',
  },
  actions: {
    addChecklist: 'Add to action checklist',
    completedToday: 'Completed today',
    noActionsYet: 'No actions yet. Pick one from a verse.',
  },
};

export class I18nService {
  private currentLocale = 'en';
  private dict: Dictionary = en;

  t<K1 extends keyof Dictionary, K2 extends keyof Dictionary[K1]>(section: K1, key: K2): string {
    const sec = this.dict[section];
    if (sec && key in sec) {
      return String(sec[key]);
    }
    return String(key);
  }

  getLocale(): string {
    return this.currentLocale;
  }
}

export const i18n = new I18nService();
