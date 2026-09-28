import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface PackManifest {
  manifest_version: number;
  content_version: string;
  created_at: string;
  packs: {
    id: string;
    kind: 'text' | 'orientation';
    juz?: number[];
    size: number;
    sha256: string;
    url: string;
  }[];
  audio_index_url: string;
  signature?: string;
  key_id?: string;
}

export function buildPacks(sourceDir: string, outputDir: string, contentVersion: string): PackManifest {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const manifest: PackManifest = {
    manifest_version: 1,
    content_version: contentVersion,
    created_at: new Date().toISOString(),
    packs: [],
    audio_index_url: '/audio/index.json',
  };

  // Build orientation pack
  const orientationPackId = 'orientation-v1';
  const orientationFile = path.join(outputDir, `${orientationPackId}.json`);
  const orientationData = {
    content_version: contentVersion,
    kind: 'orientation',
    built_at: new Date().toISOString(),
  };
  const orientationContent = JSON.stringify(orientationData);
  fs.writeFileSync(orientationFile, orientationContent, 'utf-8');

  const orientationSha256 = crypto.createHash('sha256').update(orientationContent).digest('hex');

  manifest.packs.push({
    id: orientationPackId,
    kind: 'orientation',
    size: Buffer.byteLength(orientationContent),
    sha256: orientationSha256,
    url: `/packs/${orientationPackId}.json`,
  });

  // Write initial manifest file
  const manifestFile = path.join(outputDir, 'manifest.json');
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2), 'utf-8');

  return manifest;
}
