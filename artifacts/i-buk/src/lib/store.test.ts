import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canSetFolderParent,
  canSetTopicParent,
  folderDescendantIds,
  moveFolder,
  parseWorkspace,
  sampleWorkspace,
  topicDescendantIds,
} from './store.ts';

test('normalizes legacy sessions and preserves their history', () => {
  const source = sampleWorkspace();
  const legacy = {
    ...source,
    version: 1,
    sessions: [{
      id: 'legacy-session',
      courseId: 'course-cog',
      topicId: 'topic-memory',
      date: '2026-08-01',
      minutes: 25,
    }],
  };

  const parsed = parseWorkspace(legacy);
  assert.ok(parsed);
  assert.equal(parsed.version, 2);
  assert.equal(parsed.sessions[0]?.durationMinutes, 25);
  assert.equal(parsed.sessions[0]?.startedAt, '2026-08-01T12:00:00');
  assert.equal(parsed.sessions[0]?.source, 'manual');
});

test('rejects malformed hierarchy references and cycles', () => {
  const source = sampleWorkspace();
  const missingParent = {
    ...source,
    topics: source.topics.map((topic) => topic.id === 'topic-memory' ? { ...topic, parentId: 'missing' } : topic),
  };
  assert.equal(parseWorkspace(missingParent), null);

  const cyclic = {
    ...source,
    topics: source.topics.map((topic) =>
      topic.id === 'topic-memory' ? { ...topic, parentId: 'topic-research' } :
      topic.id === 'topic-research' ? { ...topic, parentId: 'topic-memory' } : topic,
    ),
  };
  assert.equal(parseWorkspace(cyclic), null);
});

test('hierarchy traversal stays cycle-safe and blocks invalid moves', () => {
  const source = sampleWorkspace();
  const cyclic = {
    ...source,
    topics: source.topics.map((topic) =>
      topic.id === 'topic-memory' ? { ...topic, parentId: 'topic-research' } :
      topic.id === 'topic-research' ? { ...topic, parentId: 'topic-memory' } : topic,
    ),
  };
  assert.deepEqual(topicDescendantIds(cyclic, 'topic-memory'), ['topic-research']);
  assert.equal(canSetTopicParent(cyclic, 'topic-memory', 'topic-research'), false);

  const nested = {
    ...source,
    folders: [
      { id: 'folder-a', courseId: 'course-cog', name: 'A', sortOrder: 0 },
      { id: 'folder-b', courseId: 'course-cog', parentId: 'folder-a', name: 'B', sortOrder: 0 },
      { id: 'folder-c', courseId: 'course-cog', parentId: 'folder-b', name: 'C', sortOrder: 0 },
    ],
  };
  assert.deepEqual(folderDescendantIds(nested, 'folder-a'), ['folder-b', 'folder-c']);
  assert.equal(canSetFolderParent(nested, 'folder-a', 'folder-c'), false);
  assert.equal(moveFolder(nested, 'folder-c', 'folder-a')?.folders.find((folder) => folder.id === 'folder-c')?.parentId, 'folder-a');
});