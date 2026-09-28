import { useState } from 'react';
import { generateDeviceDEK, encryptJournalPayload } from '@tadabbur/crypto';
import { db } from '../../core/db';
import { analytics } from '../../core/analytics';
import { featureFlags } from '../../core/flags';

interface Props {
  verseRef: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

// In-memory key cache for active session
let deviceKeyCache: CryptoKey | null = null;

async function getOrCreateDEK(): Promise<CryptoKey> {
  if (deviceKeyCache) return deviceKeyCache;
  deviceKeyCache = await generateDeviceDEK();
  return deviceKeyCache;
}

export function JournalEditor({ verseRef, isOpen, onClose, onSaved }: Props) {
  const isFramed = featureFlags.get('framed_journal_prompts');
  const [noteBody, setNoteBody] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const promptText = isFramed
    ? 'What emotion or reflection did this verse stir within your heart?'
    : 'Write your private reflection on this verse...';

  async function handleSave() {
    if (!noteBody.trim()) return;
    setSaving(true);

    try {
      const dek = await getOrCreateDEK();
      const variant = isFramed ? 'framed' : 'open';

      const payload = {
        body: noteBody,
        tags: [],
        promptVariant: variant as 'framed' | 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // AES-256-GCM envelope encryption
      const envelope = await encryptJournalPayload(dek, payload);

      // Save binary ciphertext to IndexedDB
      await db.saveJournalEntry(verseRef, envelope.ciphertext, envelope.nonce, envelope.keyId);

      // Log note_saved analytics event (ZERO user text)
      analytics.track('note_saved', {
        char_count: noteBody.length,
        variant,
      });

      // Clear volatile memory buffer
      setNoteBody('');
      setSaving(false);
      onSaved?.();
      onClose();
    } catch (err) {
      console.error('[JournalEditor] Encryption or save failed:', err);
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Private Reflection on Verse ${verseRef}`}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 p-6 space-y-4 text-stone-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded">
                Verse {verseRef}
              </span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
                🔒 E2E Encrypted
              </span>
            </div>
            <h3 className="text-base font-bold text-stone-900 mt-1">My Reflection</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-sm"
          >
            &times;
          </button>
        </div>

        {/* Prompt Header */}
        <p className="text-xs text-amber-950 bg-amber-50/70 p-3 rounded-xl border border-amber-200/60 font-medium">
          {promptText}
        </p>

        {/* Mode Toggle Tabs */}
        <div className="flex items-center justify-end space-x-2 text-xs">
          <button
            onClick={() => setIsPreview(false)}
            className={`px-3 py-1 rounded-md font-medium ${
              !isPreview ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setIsPreview(true)}
            className={`px-3 py-1 rounded-md font-medium ${
              isPreview ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'
            }`}
          >
            Preview
          </button>
        </div>

        {/* Input / Preview Area */}
        {!isPreview ? (
          <textarea
            rows={5}
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            placeholder="Write markdown reflection..."
            className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-sans"
          />
        ) : (
          <div className="p-3 rounded-xl border border-stone-200 bg-stone-50 min-h-[120px] text-sm text-stone-800 leading-relaxed font-sans whitespace-pre-wrap">
            {noteBody || <span className="text-stone-400 italic">Nothing to preview.</span>}
          </div>
        )}

        {/* Security Assurance Notice */}
        <p className="text-[11px] text-stone-500">
          Notes are encrypted with AES-256-GCM before saving to your device. Only binary ciphertext is stored locally.
        </p>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-stone-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !noteBody.trim()}
            className="px-5 py-2 bg-amber-900 hover:bg-amber-950 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
          >
            {saving ? 'Encrypting & Saving...' : 'Save Encrypted Note'}
          </button>
        </div>
      </div>
    </div>
  );
}
