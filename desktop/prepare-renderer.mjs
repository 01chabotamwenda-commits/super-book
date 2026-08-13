import { cp, access, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const desktopDir = path.dirname(fileURLToPath(import.meta.url));
const sourceDir = path.resolve(desktopDir, '..', 'artifacts', 'i-buk', 'dist', 'public');
const targetDir = path.join(desktopDir, 'renderer');

await access(path.join(sourceDir, 'index.html'));
await rm(targetDir, { recursive: true, force: true });
await cp(sourceDir, targetDir, { recursive: true });

console.log(`Prepared renderer from ${sourceDir}`);