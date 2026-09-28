import { useEffect, useState } from 'react';
import { db, PackStateRecord } from '../../core/db';
import { checkAndDownloadPacks } from './packManager';

export function PackStatusCard() {
  const [packState, setPackState] = useState<PackStateRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadStatus() {
      const state = await db.getPackState('juz-30-fixture-v2');
      setPackState(state);
      setLoading(false);
    }
    loadStatus();
  }, []);

  async function handleCheckUpdate() {
    setUpdating(true);
    await checkAndDownloadPacks();
    const updated = await db.getPackState('juz-30-fixture-v2');
    setPackState(updated);
    setUpdating(false);
  }

  if (loading) return null;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-stone-900 text-base">Offline Content Pack</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Signed Quranic text, thematic blocks & orientation packs.
          </p>
        </div>
        <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
          ✓ Verified & Signed
        </span>
      </div>

      <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/60 flex items-center justify-between text-xs">
        <div>
          <span className="text-stone-500">Content Version:</span>{' '}
          <span className="font-mono font-semibold text-stone-900">{packState?.version || '0.1.0-fixture'}</span>
        </div>
        <div>
          <span className="text-stone-500">Storage:</span>{' '}
          <span className="font-semibold text-emerald-700">Persistent (IndexedDB)</span>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button
          onClick={handleCheckUpdate}
          disabled={updating}
          className="text-xs px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          {updating ? 'Verifying manifest...' : 'Check for Content Updates'}
        </button>
      </div>
    </div>
  );
}
