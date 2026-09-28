import { db, OutboxRecord, JournalEntryRecord } from '../db';
import { supabase } from '../supabase';

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncedAt: string | null;
  pendingCount: number;
  error: string | null;
}

class SyncEngine {
  private isSyncing = false;
  private lastSyncedAt: string | null = null;
  private listeners: Array<(status: SyncStatus) => void> = [];

  subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    this.notify();
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(error: string | null = null) {
    db.getPendingOutboxItems()
      .then((pending) => {
        const status: SyncStatus = {
          isSyncing: this.isSyncing,
          lastSyncedAt: this.lastSyncedAt,
          pendingCount: pending.length,
          error,
        };
        this.listeners.forEach((l) => l(status));
      })
      .catch(() => {});
  }

  // QUEUEING METHODS

  async queueJournalSave(
    verseRef: string,
    ciphertext: Uint8Array,
    nonce: Uint8Array,
    keyId: string
  ): Promise<JournalEntryRecord> {
    const entry = await db.saveJournalEntry(verseRef, ciphertext, nonce, keyId);
    await db.addOutboxItem('journal_saved', {
      id: entry.id,
      verseRef: entry.verseRef,
      ciphertextBase64: uint8ArrayToBase64(ciphertext),
      nonceBase64: uint8ArrayToBase64(nonce),
      keyId: entry.keyId,
      version: entry.version,
      updatedAt: entry.updatedAt,
    });
    this.triggerSync();
    return entry;
  }

  async queueJournalDelete(id: string): Promise<void> {
    await db.deleteJournalEntry(id);
    await db.addOutboxItem('journal_deleted', { id, deletedAt: new Date().toISOString() });
    this.triggerSync();
  }

  async queueActionItem(templateId: string, verseRef: string) {
    const item = await db.addActionItem(templateId, verseRef);
    await db.addOutboxItem('action_added', item);
    this.triggerSync();
    return item;
  }

  async queueActionCompletion(actionId: string, day: string) {
    const completed = await db.toggleActionCompletion(actionId, day);
    await db.addOutboxItem('action_completed', { actionId, day, completed });
    this.triggerSync();
    return completed;
  }

  async queueKeyWrap(keyWrap: any) {
    await db.saveSetting('journalKeyWrap', keyWrap);
    await db.addOutboxItem('key_wrap_saved', keyWrap);
    this.triggerSync();
  }

  // OUTBOX PROCESSING & SYNC RUNNER

  async triggerSync(): Promise<void> {
    if (this.isSyncing) return;
    const user = supabase.getUser();
    if (!user) {
      // Anonymous local mode: outbox items remain safely queued in IndexedDB
      this.notify();
      return;
    }

    this.isSyncing = true;
    this.notify();

    try {
      const pendingItems = await db.getPendingOutboxItems();
      for (const item of pendingItems) {
        await this.processOutboxItem(user.id, item);
      }

      await this.pullRemoteChanges(user.id);
      this.lastSyncedAt = new Date().toISOString();
      this.notify(null);
    } catch (err: any) {
      this.notify(err?.message || 'Sync failed');
    } finally {
      this.isSyncing = false;
      this.notify();
    }
  }

  private async processOutboxItem(userId: string, item: OutboxRecord): Promise<void> {
    try {
      switch (item.type) {
        case 'journal_saved':
          await supabase.upsertTableRecord('journal_entry', {
            id: item.payload.id,
            user_id: userId,
            verse_ref: item.payload.verseRef,
            ciphertext: item.payload.ciphertextBase64,
            nonce: item.payload.nonceBase64,
            key_id: item.payload.keyId,
            version: item.payload.version,
            updated_at: item.payload.updatedAt,
          });
          break;

        case 'journal_deleted':
          await supabase.upsertTableRecord('journal_entry', {
            id: item.payload.id,
            user_id: userId,
            deleted_at: item.payload.deletedAt,
          });
          break;

        case 'action_added':
          await supabase.upsertTableRecord('action_item', {
            id: item.payload.id,
            user_id: userId,
            template_id: item.payload.templateId,
            verse_ref: item.payload.verseRef,
            status: item.payload.status,
            created_at: item.payload.createdAt,
          });
          break;

        case 'action_completed':
          if (item.payload.completed) {
            await supabase.upsertTableRecord('action_completion', {
              action_id: item.payload.actionId,
              user_id: userId,
              day: item.payload.day,
            });
          }
          break;

        case 'key_wrap_saved':
          await supabase.upsertTableRecord('key_wrap', {
            user_id: userId,
            wrapped_dek: uint8ArrayToBase64(item.payload.wrappedDek),
            kdf_params: item.payload.kdfParams,
            recovery_wrapped_dek: uint8ArrayToBase64(item.payload.recoveryWrappedDek),
            key_id: item.payload.keyId,
            version: item.payload.version,
          });
          break;
      }

      await db.removeOutboxItem(item.id);
    } catch (err) {
      await db.markOutboxItemFailed(item.id);
      throw err;
    }
  }

  private async pullRemoteChanges(_userId: string): Promise<void> {
    const remoteJournals = await supabase.fetchTableChanges<any>('journal_entry', this.lastSyncedAt || undefined);
    const localJournals = await db.getJournalEntries();
    const localMap = new Map(localJournals.map((j) => [j.id, j]));

    for (const rj of remoteJournals) {
      if (rj.deleted_at) {
        if (localMap.has(rj.id)) {
          await db.deleteJournalEntry(rj.id);
        }
        continue;
      }

      const existingLocal = localMap.get(rj.id);
      const remoteCiphertext = base64ToUint8Array(rj.ciphertext);
      const remoteNonce = base64ToUint8Array(rj.nonce);

      if (!existingLocal) {
        await db.saveJournalEntry(rj.verse_ref, remoteCiphertext, remoteNonce, rj.key_id);
      } else {
        // Conflict resolution: compare updatedAt / ciphertext
        if (existingLocal.updatedAt !== rj.updated_at) {
          // Preserve both local and remote version as a separate entry labeled "Copy from another device"
          await db.saveJournalEntry(
            `${rj.verse_ref} (Copy from another device)`,
            remoteCiphertext,
            remoteNonce,
            rj.key_id
          );
        }
      }
    }
  }

  // Upload local items when user first logs in
  async uploadLocalDataOnSignIn(): Promise<void> {
    const localEntries = await db.getJournalEntries();
    for (const e of localEntries) {
      await db.addOutboxItem('journal_saved', {
        id: e.id,
        verseRef: e.verseRef,
        ciphertextBase64: uint8ArrayToBase64(e.ciphertext),
        nonceBase64: uint8ArrayToBase64(e.nonce),
        keyId: e.keyId,
        version: e.version,
        updatedAt: e.updatedAt,
      });
    }

    const keyWrap = await db.getSetting<any>('journalKeyWrap');
    if (keyWrap) {
      await db.addOutboxItem('key_wrap_saved', keyWrap);
    }

    await this.triggerSync();
  }
}

export const syncService = new SyncEngine();
