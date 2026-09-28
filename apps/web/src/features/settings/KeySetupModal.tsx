import React, { useState } from 'react';
import {
  generateRecoveryKey,
  createKeyWrap,
  KeyWrapMetadata,
} from '@tadabbur/crypto';
import { db } from '../../core/db';
import { analytics } from '../../core/analytics';

interface KeySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawDek: Uint8Array;
  onSetupComplete: (keyWrap: KeyWrapMetadata) => void;
}

export const KeySetupModal: React.FC<KeySetupModalProps> = ({
  isOpen,
  onClose,
  rawDek,
  onSetupComplete,
}) => {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleGenerateRecoveryKey = () => {
    if (!disclaimerAccepted) {
      setError('Please acknowledge the loss disclaimer to proceed.');
      return;
    }
    if (passphrase.length < 6) {
      setError('Passphrase must be at least 6 characters long.');
      return;
    }
    if (passphrase !== confirmPassphrase) {
      setError('Passphrases do not match.');
      return;
    }

    setError(null);
    const key = generateRecoveryKey();
    setRecoveryKey(key);
  };

  const handleCopyKey = async () => {
    if (!recoveryKey) return;
    try {
      await navigator.clipboard.writeText(recoveryKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSaveKeyWrap = async () => {
    if (!recoveryKey || !passphrase) return;

    setIsProcessing(true);
    setError(null);

    try {
      const keyWrap = await createKeyWrap(rawDek, passphrase, recoveryKey);
      await db.saveSetting('journalKeyWrap', keyWrap);

      analytics.track('recovery_key_saved', {});
      onSetupComplete(keyWrap);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to wrap and save key encryption data.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="key-setup-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-emerald-950 dark:text-emerald-50 border border-emerald-100 dark:border-emerald-800">
        <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-800 pb-4">
          <h2 id="key-setup-title" className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
            Set Up Note Encryption & Recovery
          </h2>
          <button
            onClick={onClose}
            className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-4 text-sm text-emerald-800 dark:text-emerald-200">
          <p>
            Your journal reflections are protected with end-to-end encryption. Only you hold the decryption key.
          </p>

          {/* Mandatory Disclaimer Checkbox */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={disclaimerAccepted}
                onChange={(e) => {
                  setDisclaimerAccepted(e.target.checked);
                  setError(null);
                }}
                className="mt-1 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-xs leading-relaxed text-amber-900 dark:text-amber-200 font-medium">
                I understand that my notes are end-to-end encrypted. If I lose both my passphrase and my recovery key, my notes cannot be recovered by anyone, including Tadabbur.
              </span>
            </label>
          </div>

          {/* Passphrase inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
                Passphrase (min 6 characters)
              </label>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter a strong passphrase"
                className="w-full rounded-lg border border-emerald-300 bg-emerald-50/50 p-2.5 text-sm text-emerald-900 focus:border-emerald-500 focus:outline-none dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
                Confirm Passphrase
              </label>
              <input
                type="password"
                value={confirmPassphrase}
                onChange={(e) => setConfirmPassphrase(e.target.value)}
                placeholder="Re-enter passphrase"
                className="w-full rounded-lg border border-emerald-300 bg-emerald-50/50 p-2.5 text-sm text-emerald-900 focus:border-emerald-500 focus:outline-none dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100"
              />
            </div>
          </div>

          {!recoveryKey ? (
            <button
              onClick={handleGenerateRecoveryKey}
              disabled={!disclaimerAccepted || passphrase.length < 6 || passphrase !== confirmPassphrase}
              className="w-full rounded-xl bg-emerald-700 py-2.5 font-semibold text-white shadow hover:bg-emerald-800 disabled:opacity-50 transition"
            >
              Generate Recovery Key
            </button>
          ) : (
            <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-800 dark:bg-emerald-900/30">
              <label className="block text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                Your Secret Recovery Key (Store securely!)
              </label>
              <div className="flex items-center justify-between rounded-lg bg-white p-3 font-mono text-base tracking-wider text-emerald-950 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-700">
                <span>{recoveryKey}</span>
                <button
                  onClick={handleCopyKey}
                  className="rounded bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-800 dark:text-emerald-100"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Write down or save this key in a secure password manager.
              </p>

              <button
                onClick={handleSaveKeyWrap}
                disabled={isProcessing}
                className="w-full rounded-xl bg-emerald-800 py-2.5 font-semibold text-white shadow hover:bg-emerald-900 transition disabled:opacity-50"
              >
                {isProcessing ? 'Saving Key Wrap...' : 'Save & Finish Setup'}
              </button>
            </div>
          )}

          {error && (
            <p className="text-xs font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
