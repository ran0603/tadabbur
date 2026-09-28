import * as fs from 'fs';
import * as path from 'path';

export interface ValidationReport {
  valid: boolean;
  surahsChecked: number;
  blocksChecked: number;
  fixturesFoundInProd: boolean;
  errors: string[];
}

export function validateContentPacks(contentDir: string, isProduction: boolean = false): ValidationReport {
  const errors: string[] = [];
  let surahsChecked = 0;
  let blocksChecked = 0;
  let fixturesFoundInProd = false;

  if (!fs.existsSync(contentDir)) {
    return {
      valid: false,
      surahsChecked: 0,
      blocksChecked: 0,
      fixturesFoundInProd: false,
      errors: [`Content directory does not exist: ${contentDir}`],
    };
  }

  const files = fs.readdirSync(contentDir);
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const filePath = path.join(contentDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    if (content.fixture === true) {
      if (isProduction) {
        fixturesFoundInProd = true;
        errors.push(`CRITICAL: Fixture file ${file} found in production release pack build!`);
      }
    }

    if (Array.isArray(content.surahs)) {
      surahsChecked += content.surahs.length;
      for (const s of content.surahs) {
        if (!s.textChecksum) {
          errors.push(`Surah ${s.id} (${s.nameEn}) missing SHA-256 text checksum.`);
        }
      }
    }

    if (Array.isArray(content.blocks)) {
      blocksChecked += content.blocks.length;
      // Check for range gaps/overlaps per surah
      const blocksBySurah: Record<number, any[]> = {};
      for (const b of content.blocks) {
        blocksBySurah[b.surahId] = blocksBySurah[b.surahId] || [];
        blocksBySurah[b.surahId].push(b);
      }

      for (const [surahId, blocks] of Object.entries(blocksBySurah)) {
        blocks.sort((a, b) => a.verseStart - b.verseStart);
        let expectedStart = 1;
        for (const b of blocks) {
          if (b.verseStart > expectedStart) {
            errors.push(`Surah ${surahId}: Gap in block range before "${b.title}" (expected verse ${expectedStart}, found ${b.verseStart})`);
          } else if (b.verseStart < expectedStart) {
            errors.push(`Surah ${surahId}: Overlap in block range at "${b.title}" (verse ${b.verseStart})`);
          }
          expectedStart = b.verseEnd + 1;
        }
      }
    }
  }

  const valid = errors.length === 0 && !fixturesFoundInProd;
  return { valid, surahsChecked, blocksChecked, fixturesFoundInProd, errors };
}
