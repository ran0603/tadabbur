import { describe, it, expect } from 'vitest';
import {
  generateRecoveryKey,
  normalizeRecoveryKey,
  createKeyWrap,
  unwrapDEKWithPassphrase,
  unwrapDEKWithRecoveryKey,
  importRawDEK,
} from './keyWrapping';
import { encryptJournalPayload, decryptJournalEnvelope } from './journalCrypto';

describe('keyWrapping', () => {
  it('generates formatted recovery key and normalizes input', () => {
    const recKey = generateRecoveryKey();
    expect(recKey).toMatch(/^[2-9A-HJ-NP-Z]{4}(-[2-9A-HJ-NP-Z]{4}){4,5}$/);

    const normalized = normalizeRecoveryKey(' a2b3-c4d5 ');
    expect(normalized).toBe('A2B3C4D5');
  });

  it('wraps and unwraps DEK using passphrase and recovery key', async () => {
    const rawDek = crypto.getRandomValues(new Uint8Array(32));
    const passphrase = 'SecretPassphrase123!';
    const recoveryKey = generateRecoveryKey();

    const keyWrap = await createKeyWrap(rawDek, passphrase, recoveryKey);

    expect(keyWrap.version).toBe(1);
    expect(keyWrap.wrappedDek.length).toBeGreaterThan(0);
    expect(keyWrap.recoveryWrappedDek.length).toBeGreaterThan(0);

    // Unwrap with passphrase
    const dekFromPass = await unwrapDEKWithPassphrase(keyWrap, passphrase);
    expect(dekFromPass).toBeDefined();

    // Unwrap with recovery key
    const dekFromRec = await unwrapDEKWithRecoveryKey(keyWrap, recoveryKey);
    expect(dekFromRec).toBeDefined();

    // Test encryption and decryption with derived DEK
    const testPayload = {
      body: 'Private test journal note',
      tags: ['test'],
      promptVariant: 'framed' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const envelope = await encryptJournalPayload(dekFromPass, testPayload);
    const decrypted = await decryptJournalEnvelope(dekFromRec, envelope);
    expect(decrypted.body).toBe('Private test journal note');
  });

  it('fails with wrong passphrase or recovery key', async () => {
    const rawDek = crypto.getRandomValues(new Uint8Array(32));
    const passphrase = 'CorrectPassphrase!';
    const recoveryKey = generateRecoveryKey();

    const keyWrap = await createKeyWrap(rawDek, passphrase, recoveryKey);

    await expect(
      unwrapDEKWithPassphrase(keyWrap, 'WrongPassphrase!')
    ).rejects.toThrow("This entry can't be opened on this device");

    await expect(
      unwrapDEKWithRecoveryKey(keyWrap, 'INVALID-RECOVERY-KEY-FORMAT')
    ).rejects.toThrow("This entry can't be opened on this device");
  });
});
