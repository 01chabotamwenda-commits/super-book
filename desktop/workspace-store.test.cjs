const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs/promises');
const { loadWorkspace, saveWorkspace } = require('./workspace-store.cjs');

test('persists and reloads a workspace atomically', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'ibuk-workspace-'));
  const filePath = path.join(directory, 'nested', 'workspace.json');
  const workspace = { version: 2, updatedAt: '2026-08-13T12:00:00.000Z', courses: [] };

  await saveWorkspace(filePath, workspace);
  assert.deepEqual(await loadWorkspace(filePath), workspace);
  assert.equal(await fs.access(`${filePath}.tmp`).then(() => true, () => false), false);
});

test('treats a missing desktop workspace as a first launch', async () => {
  const filePath = path.join(os.tmpdir(), 'ibuk-missing-workspace', 'workspace.json');
  assert.equal(await loadWorkspace(filePath), null);
});