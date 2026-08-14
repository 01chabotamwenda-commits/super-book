import { cp, access, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const desktopDir = path.dirname(fileURLToPath(import.meta.url));
const sourceDir = path.resolve(desktopDir, '..', 'artifacts', 'i-buk', 'dist', 'public');
const targetDir = path.join(desktopDir, 'renderer');

await access(path.join(sourceDir, 'index.html'));
const indexHtml = await readFile(path.join(sourceDir, 'index.html'), 'utf8');
if (!indexHtml.includes('./assets/')) {
  throw new Error('The desktop renderer must be built with BASE_PATH=./ so packaged assets resolve from file://.');
}
await rm(targetDir, { recursive: true, force: true });
await cp(sourceDir, targetDir, { recursive: true });

console.log(`Prepared renderer from ${sourceDir}`);