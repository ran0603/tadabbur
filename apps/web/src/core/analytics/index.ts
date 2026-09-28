export interface AnalyticsEventMap {
  surah_opened: { surah_id: number; content_version?: string };
  block_viewed: { surah_id: number; block_id: string; dwell_ms?: number };
  orientation_shown: { surah_id: number };
  orientation_dismissed: { surah_id: number; dwell_ms?: number };
  orientation_completed: { surah_id: number };
  orientation_section_expanded: { surah_id: number };
  symmetry_viewed: { surah_id: number };
  roadmap_opened: { surah_id: number };
  roadmap_jumped: { surah_id: number; block_id: string };
  action_added: { template_id: string; verse_ref: string };
  action_completed: { template_id: string; day_index: number };
  note_saved: { char_count: number; variant: 'framed' | 'open' | 'null' };
  recovery_key_saved: Record<string, never> | {};
  key_restore_failed: Record<string, never> | {};
  audio_played: { verse_ref: string; reciter_id: string };
  pwa_installed: { platform: string };
  consent_given: { granted: boolean };
  font_scale_changed: { font_scale: number };
  perf_app_ready_ms: { duration_ms: number };
  perf_panel_open_ms: { duration_ms: number };
}

export interface Analytics {
  setConsent(consentGranted: boolean): void;
  hasConsent(): boolean;
  getAnonymousId(): string;
  track<E extends keyof AnalyticsEventMap>(event: E, properties?: AnalyticsEventMap[E]): void;
}

class RedactedAnalytics implements Analytics {
  private consentGranted: boolean = false;
  private anonymousId: string = '';

  constructor() {
    this.anonymousId = this.getOrInitAnonymousId();
    const storedConsent = localStorage.getItem('tadabbur_analytics_consent');
    this.consentGranted = storedConsent === 'true';
  }

  private getOrInitAnonymousId(): string {
    let id = localStorage.getItem('tadabbur_anon_id');
    if (!id) {
      id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `anon_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem('tadabbur_anon_id', id);
    }
    return id;
  }

  setConsent(granted: boolean): void {
    this.consentGranted = granted;
    localStorage.setItem('tadabbur_analytics_consent', String(granted));
    if (granted) {
      this.track('consent_given', { granted: true });
    }
  }

  hasConsent(): boolean {
    return this.consentGranted;
  }

  getAnonymousId(): string {
    return this.anonymousId;
  }

  track<E extends keyof AnalyticsEventMap>(event: E, properties?: AnalyticsEventMap[E]): void {
    if (!this.consentGranted) return;

    const sanitizedProps = this.sanitizeProps(properties);
    const payload = {
      event,
      anonymousId: this.anonymousId,
      timestamp: new Date().toISOString(),
      properties: sanitizedProps,
    };

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Analytics] Event: ${String(event)}`, payload);
    }
  }

  private sanitizeProps(props: any): any {
    if (!props || typeof props !== 'object') return props;
    const clean: Record<string, any> = {};
    for (const [key, val] of Object.entries(props)) {
      if (['text', 'note', 'body', 'passphrase', 'key', 'ciphertext', 'userText', 'input'].includes(key)) {
        continue;
      }
      clean[key] = val;
    }
    return clean;
  }
}

export const analytics: Analytics = new RedactedAnalytics();
