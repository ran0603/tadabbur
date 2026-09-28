export interface SupabaseUser {
  id: string;
  email: string;
}

export interface SupabaseSession {
  accessToken: string;
  user: SupabaseUser;
}

const metaEnv = (import.meta as any).env || {};
const SUPABASE_URL = metaEnv.VITE_SUPABASE_URL || 'https://mock.supabase.co';
const SUPABASE_ANON_KEY = metaEnv.VITE_SUPABASE_ANON_KEY || 'mock-anon-key';
const TOKEN_STORAGE_KEY = 'tadabbur_supabase_session';

export class SupabaseClient {
  private session: SupabaseSession | null = null;

  constructor() {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) {
      try {
        this.session = JSON.parse(stored);
      } catch {
        this.session = null;
      }
    }
  }

  getSession(): SupabaseSession | null {
    return this.session;
  }

  getUser(): SupabaseUser | null {
    return this.session?.user || null;
  }

  async sendMagicLink(email: string): Promise<{ success: boolean; message: string }> {
    if (SUPABASE_URL.includes('mock.supabase.co')) {
      // Mock mode for local testing without configured remote Supabase credentials
      const mockSession: SupabaseSession = {
        accessToken: `mock-token-${Date.now()}`,
        user: { id: `usr-${Date.now()}`, email },
      };
      this.session = mockSession;
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(mockSession));
      return {
        success: true,
        message: 'Magic link sent! (Mock session activated for local offline testing)',
      };
    }

    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email, create_user: true }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.msg || errData.error_description || 'Failed to send magic link');
      }

      return {
        success: true,
        message: 'Check your email inbox for your magic sign-in link.',
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error sending magic link' };
    }
  }

  signOut(): void {
    this.session = null;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
    };
    if (this.session?.accessToken) {
      headers.Authorization = `Bearer ${this.session.accessToken}`;
    }
    return headers;
  }

  async upsertTableRecord(table: string, record: Record<string, any>): Promise<void> {
    if (SUPABASE_URL.includes('mock.supabase.co')) {
      // Mock upload for local offline mode
      return;
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        Prefer: 'return=minimal, resolution=merge-duplicates',
      },
      body: JSON.stringify(record),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to upsert to ${table}: ${res.status} ${text}`);
    }
  }

  async fetchTableChanges<T>(table: string, sinceIso?: string): Promise<T[]> {
    if (SUPABASE_URL.includes('mock.supabase.co')) {
      return [];
    }

    let url = `${SUPABASE_URL}/rest/v1/${table}?select=*`;
    if (sinceIso) {
      url += `&updated_at=gt.${encodeURIComponent(sinceIso)}`;
    }

    const res = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch changes from ${table}`);
    }

    return res.json();
  }
}

export const supabase = new SupabaseClient();
