import { createClient } from '@supabase/supabase-js';
import { localDb } from '../db/indexedDB';

// Optional Supabase credentials from environment or fallback
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Strategy 2: Write Strategy (Local-First with Mutation Queue)
 * Listens to window 'online' events or triggers manual sync.
 * Extracts records where is_synced == 0, pushes changes to Supabase via batch upsert,
 * and updates local is_synced to 1 upon success.
 */
export async function syncOfflineReflections(): Promise<{ syncedCount: number; error?: string }> {
  if (!supabase || !navigator.onLine) {
    return { syncedCount: 0, error: 'غير متصل أو لم يتم إعداد Supabase' };
  }

  try {
    const unsynced = await localDb.reflections.where('is_synced').equals(0).toArray();
    if (unsynced.length === 0) {
      return { syncedCount: 0 };
    }

    const { data: userData } = await supabase.auth.getUser();
    const currentUserId = userData?.user?.id;

    if (!currentUserId) {
      return { syncedCount: 0, error: 'يرجى تسجيل الدخول لمزامنة التأملات مع السحابة' };
    }

    const payload = unsynced.map((item) => ({
      id: item.id,
      user_id: currentUserId,
      surah_id: item.surah_id,
      verse_reference: item.verse_reference,
      reflection_text: item.reflection_text,
      action_item: item.action_item,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    const { error } = await supabase
      .from('user_reflections')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('Supabase sync error:', error);
      return { syncedCount: 0, error: error.message };
    }

    // Mark items as synced locally
    const idsToUpdate = unsynced.map((item) => item.id);
    await localDb.reflections.where('id').anyOf(idsToUpdate).modify({ is_synced: 1 });

    return { syncedCount: unsynced.length };
  } catch (err) {
    console.error('Sync failed:', err);
    return { syncedCount: 0, error: String(err) };
  }
}

// Global window online listener for sync queue
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncOfflineReflections().catch(console.error);
  });
}
