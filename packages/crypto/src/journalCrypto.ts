export interface JournalPlaintextPayload {
  body: string;
  tags: string[];
  promptVariant: 'framed' | 'open' | 'null';
  createdAt: string;
  updatedAt: string;
}

export interface EncryptedEnvelope {
  version: number;
  nonce: Uint8Array;
  ciphertext: Uint8Array;
  keyId: string;
}

const ENVELOPE_VERSION = 1;

export async function generateDeviceDEK(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    false, // Non-extractable for maximum security
    ['encrypt', 'decrypt']
  );
}

export async function encryptJournalPayload(
  dek: CryptoKey,
  payload: JournalPlaintextPayload,
  keyId: string = 'device-key-v1'
): Promise<EncryptedEnvelope> {
  const encoder = new TextEncoder();
  const plaintextBytes = encoder.encode(JSON.stringify(payload));

  // Fresh random 12-byte nonce per write
  const nonce = crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce as any },
    dek,
    plaintextBytes
  );

  return {
    version: ENVELOPE_VERSION,
    nonce,
    ciphertext: new Uint8Array(encryptedBuffer),
    keyId,
  };
}

export async function decryptJournalEnvelope(
  dek: CryptoKey,
  envelope: EncryptedEnvelope
): Promise<JournalPlaintextPayload> {
  if (envelope.version !== ENVELOPE_VERSION) {
    throw new Error(`Unsupported envelope version: ${envelope.version}`);
  }

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: envelope.nonce as any },
      dek,
      envelope.ciphertext as any
    );

    const decoder = new TextDecoder();
    const jsonStr = decoder.decode(decryptedBuffer);
    return JSON.parse(jsonStr) as JournalPlaintextPayload;
  } catch (err) {
    throw new Error("This entry can't be opened on this device (decryption or authentication failed).");
  }
}
