import React, { useState } from 'react';
import {
  unwrapDEKWithPassphrase,
  unwrapDEKWithRecoveryKey,
  KeyWrapMetadata,
} from '@tadabbur/crypto';
import { db } from '../../core/db';
import { analytics } from '../../core/analytics';

interface KeyRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreSuccess: (dek: CryptoKey) => void;
}

export const KeyRestoreModal: React.FC<KeyRestoreModalProps> = ({
  isOpen,
  onClose,
  onRestoreSuccess,
}) => {
  const [method, setMethod] = useState<'passphrase' | 'recovery'>('passphrase');
  const [passphrase, setPassphrase] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleRestore = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const keyWrap = await db.getSetting<KeyWrapMetadata>('journalKeyWrap');

      if (!keyWrap) {
        throw new Error('No encryption key wrap data found on this device.');
      }

      let dek: CryptoKey;

      if (method === 'passphrase') {
        if (!passphrase.trim()) {
          throw new Error('Please enter your passphrase.');
        }
        dek = await unwrapDEKWithPassphrase(keyWrap, passphrase);
      } else {
        if (!recoveryKey.trim()) {
          throw new Error('Please enter your recovery key.');
        }
        dek = await unwrapDEKWithRecoveryKey(keyWrap, recoveryKey);
      }

      onRestoreSuccess(dek);
      onClose();
    } catch (err: any) {
      analytics.track('key_restore_failed', {});
      setError(
        err?.message ||
          "This entry can't be opened on this device (invalid passphrase or recovery key)."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="key-restore-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-emerald-950 dark:text-emerald-50 border border-emerald-100 dark:border-emerald-800">
        <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-800 pb-4">
          <h2 id="key-restore-title" className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
            Unlock Encrypted Notes
          </h2>
          <button
            onClick={onClose}
            className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Method selector tabs */}
          <div className="flex rounded-xl bg-emerald-100/60 p-1 dark:bg-emerald-900/40">
            <button
              onClick={() => {
                setMethod('passphrase');
                setError(null);
              }}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                method === 'passphrase'
                  ? 'bg-white text-emerald-900 shadow dark:bg-emerald-800 dark:text-emerald-100'
                  : 'text-emerald-700 dark:text-emerald-300'
              }`}
            >
              Passphrase
            </button>
            <button
              onClick={() => {
                setMethod('recovery');
                setError(null);
              }}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                method === 'recovery'
                  ? 'bg-white text-emerald-900 shadow dark:bg-emerald-800 dark:text-emerald-100'
                  : 'text-emerald-700 dark:text-emerald-300'
              }`}
            >
              Recovery Key
            </button>
          </div>

          {method === 'passphrase' ? (
            <div>
              <label className="block text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
                Enter Passphrase
              </label>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Passphrase"
                className="w-full rounded-lg border border-emerald-300 bg-emerald-50/50 p-2.5 text-sm text-emerald-900 focus:border-emerald-500 focus:outline-none dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
                Enter Recovery Key
              </label>
              <input
                type="text"
                value={recoveryKey}
                onChange={(e) => setRecoveryKey(e.target.value)}
                placeholder="e.g. A2B3-C4D5-E6F7-G8H9-J1K2-M3N4"
                className="w-full rounded-lg border border-emerald-300 bg-emerald-50/50 p-2.5 text-sm font-mono text-emerald-900 focus:border-emerald-500 focus:outline-none dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100"
              />
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/40">
              <p className="text-xs font-medium text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
          )}

          <button
            onClick={handleRestore}
            disabled={isProcessing}
            className="w-full rounded-xl bg-emerald-800 py-2.5 font-semibold text-white shadow hover:bg-emerald-900 transition disabled:opacity-50"
          >
            {isProcessing ? 'Decrypting Key...' : 'Unlock Notes'}
          </button>
        </div>
      </div>
    </div>
  );
};
