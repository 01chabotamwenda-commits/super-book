const fs = require('node:fs/promises');
const path = require('node:path');

const MAX_WORKSPACE_BYTES = 10 * 1024 * 1024;

async function loadWorkspace(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    return null;
  }
}

async function saveWorkspace(filePath, workspace) {
  const serialized = JSON.stringify(workspace);
  if (Buffer.byteLength(serialized, 'utf8') > MAX_WORKSPACE_BYTES) {
    throw new Error('Workspace export is too large.');
  }

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, serialized, { encoding: 'utf8', mode: 0o600 });
  await fs.rename(tempPath, filePath);
  return true;
}

module.exports = {
  loadWorkspace,
  saveWorkspace,
};