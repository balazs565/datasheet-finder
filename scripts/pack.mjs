// Packages the built extension (dist/) into a distributable zip under
// releases/. Run via `npm run package` (which builds first).
//
//   npm run package          → colleague zip (nested ./datasheet-finder/ folder,
//                              for "Load unpacked")
//   npm run package -- --store
//   npm run package:store    → Chrome Web Store zip (manifest.json at the ROOT,
//                              as the store requires)
import AdmZip from 'adm-zip';
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const distDir = resolve('dist');
const store = process.argv.includes('--store');

if (!existsSync(resolve(distDir, 'manifest.json'))) {
  console.error('✗ dist/ is missing or incomplete. Run "npm run build" first.');
  process.exit(1);
}

const zip = new AdmZip();
if (store) {
  // Web Store: manifest.json must be at the zip root — no nesting folder.
  zip.addLocalFolder(distDir);
} else {
  // Colleague share: nest so it extracts to ./datasheet-finder/manifest.json
  zip.addLocalFolder(distDir, 'datasheet-finder');
}

mkdirSync('releases', { recursive: true });
const suffix = store ? '-store' : '';
const out = resolve('releases', `datasheet-finder-v${pkg.version}${suffix}.zip`);
zip.writeZip(out);

console.log(`✓ Created ${out}`);
console.log(
  store
    ? '  Upload this zip to the Chrome Web Store (manifest.json is at the root).'
    : '  Share this zip with colleagues along with INSTALL.md.',
);
