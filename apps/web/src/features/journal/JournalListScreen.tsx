import { useEffect, useState } from 'react';
import { db, JournalEntryRecord } from '../../core/db';
import {
  decryptJournalEnvelope,
  JournalPlaintextPayload,
  KeyWrapMetadata,
} from '@tadabbur/crypto';
import { KeySetupModal } from '../settings/KeySetupModal';
import { KeyRestoreModal } from '../settings/KeyRestoreModal';

interface DecryptedJournalItem {
  record: JournalEntryRecord;
  payload: JournalPlaintextPayload | null;
  error: string | null;
}

interface Props {
  onBrowseSurahs: () => void;
}

let deviceKeyCache: CryptoKey | null = null;
let rawDekCache: Uint8Array | null = null;

async function getOrCreateDEK(): Promise<{ dek: CryptoKey; rawDek: Uint8Array }> {
  if (deviceKeyCache && rawDekCache) {
    return { dek: deviceKeyCache, rawDek: rawDekCache };
  }
  rawDekCache = crypto.getRandomValues(new Uint8Array(32));
  deviceKeyCache = await crypto.subtle.importKey(
    'raw',
    rawDekCache as any,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  return { dek: deviceKeyCache, rawDek: rawDekCache };
}

export function JournalListScreen({ onBrowseSurahs }: Props) {
  const [items, setItems] = useState<DecryptedJournalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyWrap, setKeyWrap] = useState<KeyWrapMetadata | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  const loadJournalAndKeyWrap = async () => {
    setLoading(true);
    const wrapRecord = await db.getSetting<KeyWrapMetadata>('journalKeyWrap');
    if (wrapRecord) {
      setKeyWrap(wrapRecord);
    }

    const records = await db.getJournalEntries();
    const { dek } = await getOrCreateDEK();

    const decryptedList: DecryptedJournalItem[] = await Promise.all(
      records.map(async (rec) => {
        try {
          const payload = await decryptJournalEnvelope(dek, {
            version: rec.version,
            nonce: rec.nonce,
            ciphertext: rec.ciphertext,
            keyId: rec.keyId,
          });
          return { record: rec, payload, error: null };
        } catch (err: any) {
          return { record: rec, payload: null, error: err.message };
        }
      })
    );

    setItems(decryptedList);
    setLoading(false);
  };

  useEffect(() => {
    loadJournalAndKeyWrap();
  }, []);

  async function handleDelete(id: string) {
    await db.deleteJournalEntry(id);
    setItems((prev) => prev.filter((i) => i.record.id !== id));
  }

  const handleRestoreSuccess = (dek: CryptoKey) => {
    deviceKeyCache = dek;
    loadJournalAndKeyWrap();
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-stone-500 animate-pulse">
        Decrypting local journal notes in volatile memory...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-serif font-bold text-stone-900">My Reflections</h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Private, verse-anchored reflections encrypted on device.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {keyWrap ? (
            <button
              onClick={() => setShowRestoreModal(true)}
              className="text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center space-x-1"
            >
              <span>🔒 Key Backup Active</span>
              <span className="text-emerald-600 text-[10px]">(Unlock / Restore)</span>
            </button>
          ) : (
            <button
              onClick={() => setShowSetupModal(true)}
              className="text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-lg flex items-center space-x-1"
            >
              <span>⚠️ Set Up Key Backup</span>
            </button>
          )}
        </div>
      </div>

      {/* Entry List or Empty State */}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-900 text-xl font-bold flex items-center justify-center mx-auto">
            ✏️
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-stone-900">No reflections yet</h3>
            <p className="text-sm text-stone-600 max-w-sm mx-auto">
              Write a private encrypted note on any verse while reading to preserve your reflections.
            </p>
          </div>
          <button
            onClick={onBrowseSurahs}
            className="px-5 py-2.5 bg-amber-900 hover:bg-amber-950 text-white text-sm font-medium rounded-xl transition-all shadow-sm"
          >
            Browse Surahs to write a note
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(({ record, payload, error }) => (
            <div
              key={record.id}
              className="p-5 rounded-2xl border border-stone-200 bg-white shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded">
                    Verse {record.verseRef}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">
                    {record.updatedAt.slice(0, 10)}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(record.id)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                >
                  Delete
                </button>
              </div>

              {error ? (
                <div className="p-4 bg-rose-50 text-rose-900 text-xs rounded-xl border border-rose-200 flex items-center justify-between">
                  <span className="font-medium">{error}</span>
                  <button
                    onClick={() => setShowRestoreModal(true)}
                    className="ml-2 px-3 py-1 bg-rose-600 text-white font-semibold rounded hover:bg-rose-700"
                  >
                    Restore Key
                  </button>
                </div>
              ) : (
                <div className="text-sm text-stone-800 leading-relaxed whitespace-pre-wrap font-sans">
                  {payload?.body}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {rawDekCache && (
        <KeySetupModal
          isOpen={showSetupModal}
          onClose={() => setShowSetupModal(false)}
          rawDek={rawDekCache}
          onSetupComplete={(wrap) => setKeyWrap(wrap)}
        />
      )}

      <KeyRestoreModal
        isOpen={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        onRestoreSuccess={handleRestoreSuccess}
      />
    </div>
  );
}
