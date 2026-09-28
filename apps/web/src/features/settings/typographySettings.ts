import { analytics } from '../../core/analytics';

export interface TypographySettings {
  fontScale: number; // 100 to 200 (%)
  wordSpacing: number; // 0.05 to 0.3 (em)
  lineHeight: number; // 1.8 to 2.8
}

const DEFAULT_SETTINGS: TypographySettings = {
  fontScale: 100,
  wordSpacing: 0.1,
  lineHeight: 2.2,
};

const STORAGE_KEY = 'tadabbur_typography_settings';

export class TypographySettingsService {
  private currentSettings: TypographySettings;

  constructor() {
    this.currentSettings = this.loadSettings();
  }

  private loadSettings(): TypographySettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[Typography] Failed to read settings from storage', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  getSettings(): TypographySettings {
    return { ...this.currentSettings };
  }

  updateSettings(newSettings: Partial<TypographySettings>): TypographySettings {
    const updated = { ...this.currentSettings, ...newSettings };

    if (newSettings.fontScale && newSettings.fontScale !== this.currentSettings.fontScale) {
      analytics.track('font_scale_changed', { font_scale: newSettings.fontScale });
    }

    this.currentSettings = updated;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('[Typography] Failed to save settings', e);
    }
    return { ...this.currentSettings };
  }

  resetToDefault(): TypographySettings {
    return this.updateSettings(DEFAULT_SETTINGS);
  }
}

export const typographyService = new TypographySettingsService();
