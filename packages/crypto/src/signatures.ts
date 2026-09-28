export interface ManifestForVerification {
  manifest_version: number;
  content_version: string;
  packs: any[];
  signature?: string;
  key_id?: string;
}

export async function verifyManifestSignature(
  manifest: ManifestForVerification,
  signingKeySecret: string = 'default_stage_b_dev_signing_key_secret_32bytes'
): Promise<boolean> {
  if (!manifest.signature) return false;

  const canonicalData = JSON.stringify({
    manifest_version: manifest.manifest_version,
    content_version: manifest.content_version,
    packs: manifest.packs,
  });

  const encoder = new TextEncoder();
  const keyData = encoder.encode(signingKeySecret);
  const messageData = encoder.encode(canonicalData);

  try {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );

    // Convert signature hex to Uint8Array
    const sigHex = manifest.signature;
    const sigBytes = new Uint8Array(
      sigHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    );

    const isValid = await crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      sigBytes,
      messageData
    );

    return isValid;
  } catch (err) {
    console.error('[Crypto] Manifest signature verification failed:', err);
    return false;
  }
}
