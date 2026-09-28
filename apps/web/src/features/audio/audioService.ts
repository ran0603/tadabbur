import { analytics } from '../../core/analytics';

export interface AudioState {
  currentVerseRef: string | null;
  reciterId: string;
  reciterName: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  repeatCount: number; // 0 = off, 3, 5, 10, 20
  repeatRemaining: number;
  error: string | null;
}

type AudioStateListener = (state: AudioState) => void;

export class AudioService {
  private audio: HTMLAudioElement | null = null;
  private state: AudioState = {
    currentVerseRef: null,
    reciterId: 'maher_al_muaiqly',
    reciterName: 'Sheikh Maher Al Muaiqly',
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    repeatCount: 0,
    repeatRemaining: 0,
    error: null,
  };

  private listeners: Set<AudioStateListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.setupAudioListeners();
    }
  }

  private setupAudioListeners() {
    if (!this.audio) return;

    this.audio.ontimeupdate = () => {
      this.updateState({
        currentTime: this.audio?.currentTime || 0,
        duration: this.audio?.duration || 0,
      });
    };

    this.audio.onended = () => {
      if (this.state.repeatRemaining > 1) {
        const remaining = this.state.repeatRemaining - 1;
        this.updateState({ repeatRemaining: remaining });
        if (this.audio) {
          this.audio.currentTime = 0;
          this.audio.play().catch((err) => this.handleError(err));
        }
      } else {
        this.updateState({ isPlaying: false, repeatRemaining: 0 });
      }
    };

    this.audio.onerror = () => {
      this.handleError(new Error('Audio load failed. Reciter file unavailable.'));
    };
  }

  private handleError(err: Error) {
    console.warn('[AudioService] Playback error:', err.message);
    this.updateState({ isPlaying: false, error: 'Audio unavailable. Retry' });
  }

  subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private updateState(partial: Partial<AudioState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((l) => l(this.state));
  }

  getState(): AudioState {
    return { ...this.state };
  }

  playVerse(verseRef: string, _surahId: number = 0) {
    const formattedVerse = verseRef.replace(':', '_');
    const audioUrl = `/audio/maher_al_muaiqly/${formattedVerse}.mp3`;

    if (this.audio) {
      this.audio.src = audioUrl;
      this.audio.currentTime = 0;
      this.updateState({
        currentVerseRef: verseRef,
        isPlaying: true,
        error: null,
        repeatRemaining: this.state.repeatCount > 0 ? this.state.repeatCount : 1,
      });

      this.audio.play().catch(() => {
        this.updateState({ isPlaying: true, error: null });
      });
    }

    analytics.track('audio_played', { verse_ref: verseRef, reciter_id: this.state.reciterId });

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `Verse ${verseRef}`,
        artist: this.state.reciterName,
        album: 'Tadabbur Quran Reader',
      });
    }
  }

  togglePlayPause() {
    if (!this.audio) return;
    if (this.state.isPlaying) {
      this.audio.pause();
      this.updateState({ isPlaying: false });
    } else if (this.state.currentVerseRef) {
      this.audio.play().then(() => {
        this.updateState({ isPlaying: true });
      }).catch(() => {
        this.updateState({ isPlaying: true });
      });
    }
  }

  seek(time: number) {
    if (this.audio) {
      this.audio.currentTime = time;
      this.updateState({ currentTime: time });
    }
  }

  setRepeatCount(count: number) {
    this.updateState({ repeatCount: count, repeatRemaining: count });
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.updateState({ currentVerseRef: null, isPlaying: false, currentTime: 0, duration: 0 });
  }
}

export const audioService = new AudioService();
