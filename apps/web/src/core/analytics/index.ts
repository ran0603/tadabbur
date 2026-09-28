export interface AnalyticsEventMap {
  surah_opened: { surah_id: number; content_version?: string };
  block_viewed: { surah_id: number; block_id: string; dwell_ms?: number };
  orientation_shown: { surah_id: number };
  orientation_dismissed: { surah_id: number; dwell_ms?: number };
  orientation_completed: { surah_id: number };
  action_added: { template_id: string; verse_ref: string };
  action_completed: { template_id: string; day_index: number };
  note_saved: { char_count: number; variant: 'framed' | 'open' | 'null' };
  audio_played: { verse_ref: string; reciter_id: string };
  pwa_installed: { platform: string };
}

export interface Analytics {
  setConsent(consentGranted: boolean): void;
  track<E extends keyof AnalyticsEventMap>(event: E, properties?: AnalyticsEventMap[E]): void;
}

class RedactedAnalytics implements Analytics {
  private hasConsent = false;

  setConsent(consentGranted: boolean): void {
    this.hasConsent = consentGranted;
  }

  track<E extends keyof AnalyticsEventMap>(event: E, properties?: AnalyticsEventMap[E]): void {
    if (!this.hasConsent) return;
    
    // Scrub properties to guarantee zero text payloads
    const sanitizedProps = this.sanitizeProps(properties);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Analytics] Event: ${String(event)}`, sanitizedProps);
    }
  }

  private sanitizeProps(props: any): any {
    if (!props || typeof props !== 'object') return props;
    const clean: Record<string, any> = {};
    for (const [key, val] of Object.entries(props)) {
      // Disallow any field named text, note, body, passphrase, key
      if (['text', 'note', 'body', 'passphrase', 'key', 'ciphertext'].includes(key)) {
        continue;
      }
      clean[key] = val;
    }
    return clean;
  }
}

export const analytics: Analytics = new RedactedAnalytics();
