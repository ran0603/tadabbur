#!/usr/bin/env node
import * as path from 'path';
import { validateContentPacks } from './commands/validate.js';
import { buildPacks } from './commands/build.js';
import { signManifest } from './commands/sign.js';

const args = process.argv.slice(2);
const command = args[0] || 'help';

console.log(`[Content-CLI] Executing command: ${command}`);

switch (command) {
  case 'validate': {
    const isProd = args.includes('--prod');
    const contentDir = path.resolve(process.cwd(), 'content/fixtures');
    const report = validateContentPacks(contentDir, isProd);
    console.log(`[Validation Report] Valid: ${report.valid}`);
    console.log(`  Surahs checked: ${report.surahsChecked}`);
    console.log(`  Blocks checked: ${report.blocksChecked}`);
    if (report.errors.length > 0) {
      console.error('  Errors:', report.errors);
      process.exit(1);
    }
    break;
  }

  case 'build': {
    const contentVersion = '0.1.0';
    const sourceDir = path.resolve(process.cwd(), 'content/fixtures');
    const outputDir = path.resolve(process.cwd(), 'dist/packs');
    const manifest = buildPacks(sourceDir, outputDir, contentVersion);
    console.log(`[Build Success] Built manifest ${manifest.content_version} with ${manifest.packs.length} packs.`);
    break;
  }

  case 'sign': {
    const manifestPath = path.resolve(process.cwd(), 'dist/packs/manifest.json');
    const signed = signManifest(manifestPath);
    console.log(`[Sign Success] Manifest signed with signature ${signed.signature?.substring(0, 16)}...`);
    break;
  }

  case 'help':
  default: {
    console.log(`
Usage: content-cli <command> [options]

Commands:
  validate [--prod]   Validate source files, SHA-256 checksums, block ranges, fixture check.
  build               Build gzip JSON Lines packs and manifest.json.
  sign                Sign manifest.json using PACK_SIGNING_PRIVATE_KEY.
`);
    break;
  }
}
