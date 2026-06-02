// Packages the built extension (dist/) into a distributable zip under
// releases/. Run via `npm run package` (which builds first).
import AdmZip from 'adm-zip';
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const distDir = resolve('dist');

if (!existsSync(resolve(distDir, 'manifest.json'))) {
  console.error('✗ dist/ is missing or incomplete. Run "npm run build" first.');
  process.exit(1);
}

const zip = new AdmZip();
// Nest under a named folder so it extracts to ./datasheet-finder/manifest.json
zip.addLocalFolder(distDir, 'datasheet-finder');

mkdirSync('releases', { recursive: true });
const out = resolve('releases', `datasheet-finder-v${pkg.version}.zip`);
zip.writeZip(out);

console.log(`✓ Created ${out}`);
console.log('  Share this zip with colleagues along with INSTALL.md.');
