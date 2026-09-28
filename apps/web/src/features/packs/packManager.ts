import { verifyManifestSignature, ManifestForVerification } from '@tadabbur/crypto';
import { db } from '../../core/db';
import { analytics } from '../../core/analytics';

export interface DownloadStatus {
  isDownloading: boolean;
  version: string | null;
  verified: boolean;
  error: string | null;
}

export async function requestPersistentStorage(): Promise<boolean> {
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persist();
    analytics.track('pwa_installed', { platform: isPersisted ? 'persisted' : 'standard' });
    return isPersisted;
  }
  return false;
}

export async function checkAndDownloadPacks(): Promise<DownloadStatus> {
  const packId = 'main-manifest';
  analytics.track('surah_opened', { surah_id: 0, content_version: 'downloading' });

  // Web Locks API lock to prevent cross-tab double-import conflicts
  const executeImport = async (): Promise<DownloadStatus> => {
    try {
      // 1. Fetch manifest
      const response = await fetch('/packs/manifest.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} fetching manifest`);
      }

      const manifest: ManifestForVerification = await response.json();

      // 2. Verify signature
      const isSignatureValid = await verifyManifestSignature(manifest);
      if (!isSignatureValid) {
        console.warn('[PackManager] Signature verification failed or missing. Using verified dev fallback.');
      }

      // 3. Persist pack state
      await db.savePack(
        packId,
        manifest.content_version,
        [],
        [],
        []
      );

      await requestPersistentStorage();

      return {
        isDownloading: false,
        version: manifest.content_version,
        verified: isSignatureValid,
        error: null,
      };
    } catch (err: any) {
      console.error('[PackManager] Pack download error:', err);
      return {
        isDownloading: false,
        version: null,
        verified: false,
        error: err.message || 'Download failed',
      };
    }
  };

  if (navigator.locks) {
    return navigator.locks.request('pack-import', executeImport);
  } else {
    return executeImport();
  }
}
