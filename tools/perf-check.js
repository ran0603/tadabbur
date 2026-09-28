import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const webDistAssetsDir = path.resolve('apps/web/dist/assets');

if (!fs.existsSync(webDistAssetsDir)) {
  console.error(`[Perf Check Error] Build directory missing at ${webDistAssetsDir}. Run "npm run build" first.`);
  process.exit(1);
}

console.log('--- Tadabbur PWA Performance Budget Verification ---');

const files = fs.readdirSync(webDistAssetsDir);
let totalJsBytes = 0;
let totalJsGzipBytes = 0;

for (const file of files) {
  if (file.endsWith('.js')) {
    const filePath = path.join(webDistAssetsDir, file);
    const content = fs.readFileSync(filePath);
    const gzipContent = zlib.gzipSync(content);

    totalJsBytes += content.length;
    totalJsGzipBytes += gzipContent.length;

    console.log(`- Bundle Chunk [${file}]: ${(content.length / 1024).toFixed(2)} kB (gzipped: ${(gzipContent.length / 1024).toFixed(2)} kB)`);
  }
}

const gzipKb = (totalJsGzipBytes / 1024).toFixed(2);
const MAX_GZIP_KB = 350;

console.log(`\nTotal JS Bundle Size (gzipped): ${gzipKb} kB / Budget: ${MAX_GZIP_KB} kB`);

if (totalJsGzipBytes / 1024 > MAX_GZIP_KB) {
  console.error(`❌ Performance budget exceeded! Total gzipped JS ${gzipKb} kB > ${MAX_GZIP_KB} kB`);
  process.exit(1);
} else {
  console.log(`✓ Performance budget check PASSED (${gzipKb} kB < ${MAX_GZIP_KB} kB)`);
}
