const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs/promises');
const { inspectPath, mimeTypeForPath, previewKindForMime } = require('./path-utils.cjs');

test('classifies previewable local media without reading file bytes', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'ibuk-path-'));
  const imagePath = path.join(directory, 'cover.png');
  await fs.writeFile(imagePath, 'not-an-image');

  const result = await inspectPath(imagePath);
  assert.equal(result.ok, true);
  assert.equal(result.exists, true);
  assert.equal(result.isFile, true);
  assert.equal(result.mimeType, 'image/png');
  assert.equal(result.previewKind, 'image');
  assert.match(result.previewUrl, /^file:/);
  assert.equal(result.sizeBytes, 12);
});

test('reports missing references and preserves their media classification', async () => {
  const result = await inspectPath(path.join(os.tmpdir(), 'ibuk-no-such-file.mp4'));
  assert.equal(result.ok, true);
  assert.equal(result.exists, false);
  assert.equal(result.previewKind, null);
  assert.equal(result.mimeType, 'video/mp4');
});

test('keeps MIME and preview classification deterministic', () => {
  assert.equal(mimeTypeForPath('lecture.MP4'), 'video/mp4');
  assert.equal(previewKindForMime('video/webm'), 'video');
  assert.equal(previewKindForMime('application/pdf'), null);
});