import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { PackManifest } from './build.js';

export function signManifest(manifestPath: string, privateKeyHex?: string): PackManifest {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest file not found: ${manifestPath}`);
  }

  const key = privateKeyHex || process.env.PACK_SIGNING_PRIVATE_KEY || 'default_stage_b_dev_signing_key_secret_32bytes';

  const raw = fs.readFileSync(manifestPath, 'utf-8');
  const manifest: PackManifest = JSON.parse(raw);

  const canonicalData = JSON.stringify({
    manifest_version: manifest.manifest_version,
    content_version: manifest.content_version,
    packs: manifest.packs,
  });

  const signature = crypto.createHmac('sha256', key).update(canonicalData).digest('hex');

  manifest.signature = signature;
  manifest.key_id = 'ed25519-key-v1';

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  return manifest;
}
