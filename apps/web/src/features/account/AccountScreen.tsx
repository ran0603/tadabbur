import React, { useEffect, useState } from 'react';
import { supabase, SupabaseUser } from '../../core/supabase';
import { syncService, SyncStatus } from '../../core/sync/syncService';

export const AccountScreen: React.FC = () => {
  const [user, setUser] = useState<SupabaseUser | null>(supabase.getUser());
  const [emailInput, setEmailInput] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncedAt: null,
    pendingCount: 0,
    error: null,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [accountDeleted, setAccountDeleted] = useState(false);

  useEffect(() => {
    const unsubscribe = syncService.subscribe((status) => {
      setSyncStatus(status);
    });
    return unsubscribe;
  }, []);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setIsSending(true);
    setAuthMessage(null);

    const res = await supabase.sendMagicLink(emailInput.trim());
    setIsSending(false);
    setAuthMessage(res.message);

    if (res.success) {
      setMagicLinkSent(true);
      setUser(supabase.getUser());
      // Trigger initial local data upload upon sign-in
      await syncService.uploadLocalDataOnSignIn();
    }
  };

  const handleSignOut = () => {
    supabase.signOut();
    setUser(null);
    setMagicLinkSent(false);
    setAuthMessage('Signed out successfully.');
  };

  const handleDeleteAccount = () => {
    supabase.signOut();
    setUser(null);
    setAccountDeleted(true);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-serif font-bold text-stone-900">Account & Sync</h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Backup and sync encrypted reflections and actions across your devices.
          </p>
        </div>
        <span
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${
            user
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-900 border-amber-200'
          }`}
        >
          {user ? '✓ Signed In' : 'Anonymous Mode'}
        </span>
      </div>

      {/* Sync Status Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-stone-900">Sync Status</h2>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-stone-500 block">Outbox Queue</span>
            <span className="text-lg font-bold text-stone-800">
              {syncStatus.pendingCount} pending write{syncStatus.pendingCount === 1 ? '' : 's'}
            </span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-stone-500 block">Last Synced</span>
            <span className="text-sm font-semibold text-stone-800">
              {syncStatus.lastSyncedAt
                ? new Date(syncStatus.lastSyncedAt).toLocaleTimeString()
                : 'Never synced'}
            </span>
          </div>
        </div>

        {syncStatus.error && (
          <p className="text-xs font-medium text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
            {syncStatus.error}
          </p>
        )}

        <button
          onClick={() => syncService.triggerSync()}
          disabled={syncStatus.isSyncing}
          className="w-full py-2.5 bg-stone-900 hover:bg-stone-950 text-white font-medium text-xs rounded-xl shadow-sm transition disabled:opacity-50"
        >
          {syncStatus.isSyncing ? 'Syncing with Supabase...' : 'Sync Now'}
        </button>
      </div>

      {/* Auth / Account Details Card */}
      {!user ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-stone-900">Sign In with Magic Link</h2>
          <p className="text-xs text-stone-600">
            Enter your email address to receive a passwordless magic link. Your existing local reflections will automatically back up to your account.
          </p>

          <form onSubmit={handleSendMagicLink} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="w-full p-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            <button
              type="submit"
              disabled={isSending || !emailInput.trim()}
              className="w-full py-2.5 bg-amber-900 hover:bg-amber-950 text-white text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {isSending ? 'Sending Magic Link...' : 'Send Magic Link'}
            </button>
          </form>

          {authMessage && (
            <div
              className={`p-3 rounded-xl border text-xs font-medium ${
                magicLinkSent
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}
            >
              {authMessage}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-stone-900">Account Details</h2>
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60 text-xs text-emerald-900">
            <span className="font-semibold block">Signed In As</span>
            <span className="text-sm font-mono font-bold text-emerald-950">{user.email}</span>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition"
            >
              Sign Out
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl transition border border-rose-200"
            >
              Delete Account
            </button>
          </div>
        </div>
      )}

      {/* Account Deletion Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4 border border-stone-200">
            <h3 className="text-lg font-bold text-rose-900">Confirm Account Deletion</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Soft-deletes your user profile immediately. Synced ciphertext, completions, and profile data will be permanently hard-purged after 30 days.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {accountDeleted && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 font-medium">
          Your account soft deletion request has been submitted. Local session cleared. Data hard purge will occur after 30 days.
        </div>
      )}
    </div>
  );
};
