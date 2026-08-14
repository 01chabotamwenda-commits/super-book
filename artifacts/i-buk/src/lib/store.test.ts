import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canSetFolderParent,
  canSetTopicParent,
  emptyWorkspace,
  folderDescendantIds,
  moveTopic,
  removeFolderBranch,
  removeTopicBranch,
  moveFolder,
  parseWorkspace,
  sampleWorkspace,
  topicDescendantIds,
} from './store.ts';

test('new workspaces start empty instead of shipping sample records', () => {
  const workspace = emptyWorkspace();
  assert.equal(workspace.courses.length, 0);
  assert.equal(workspace.topics.length, 0);
  assert.equal(workspace.materials.length, 0);
  assert.equal(workspace.exams.length, 0);
  assert.equal(workspace.sessions.length, 0);
  assert.equal(workspace.notes.length, 0);
});

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

test('reparenting appends topics and folders to the new sibling group', () => {
  const source = sampleWorkspace();
  const topicMoved = moveTopic(source, 'topic-research', 'topic-attention');
  assert.equal(topicMoved?.topics.find((topic) => topic.id === 'topic-research')?.parentId, 'topic-attention');
  assert.equal(topicMoved?.topics.find((topic) => topic.id === 'topic-research')?.sortOrder, 0);

  const nested = {
    ...source,
    folders: [
      { id: 'folder-a', courseId: 'course-cog', name: 'A', sortOrder: 0 },
      { id: 'folder-b', courseId: 'course-cog', parentId: 'folder-a', name: 'B', sortOrder: 0 },
      { id: 'folder-c', courseId: 'course-cog', parentId: 'folder-a', name: 'C', sortOrder: 1 },
    ],
  };
  const folderMoved = moveFolder(nested, 'folder-c');
  assert.equal(folderMoved?.folders.find((folder) => folder.id === 'folder-c')?.parentId, undefined);
  assert.equal(folderMoved?.folders.find((folder) => folder.id === 'folder-c')?.sortOrder, 1);
});

test('removing a topic or folder branch cleans linked records without deleting loose notes', () => {
  const source = sampleWorkspace();
  const withNestedTopic = {
    ...source,
    topics: [...source.topics, { id: 'topic-child', courseId: 'course-cog', parentId: 'topic-memory', title: 'Child topic', minutes: 20, sortOrder: 1, status: 'active' as const, important: false }],
    materials: [...source.materials, { id: 'material-child', courseId: 'course-cog', topicId: 'topic-child', title: 'Child material', kind: 'link' as const, reference: 'https://example.com' }],
    sessions: [...source.sessions, { ...source.sessions[0]!, id: 'session-child', topicId: 'topic-child' }],
    notes: [...source.notes, { id: 'note-child', title: 'Child note', body: 'Keep the note, remove only its topic target.', topicId: 'topic-child', pinned: false, updatedAt: '2026-08-13T12:00:00.000Z' }],
  };
  const topicRemoved = removeTopicBranch(withNestedTopic, 'topic-memory');
  assert.equal(topicRemoved.topics.some((topic) => topic.id === 'topic-child'), false);
  assert.equal(topicRemoved.materials.some((material) => material.id === 'material-child'), false);
  assert.equal(topicRemoved.sessions.some((session) => session.id === 'session-child'), false);
  assert.equal(topicRemoved.notes.find((note) => note.id === 'note-child')?.topicId, undefined);

  const withNestedFolder = {
    ...source,
    folders: [
      { id: 'folder-root', courseId: 'course-cog', name: 'Root', sortOrder: 0 },
      { id: 'folder-child', courseId: 'course-cog', parentId: 'folder-root', name: 'Child', sortOrder: 0 },
    ],
    materials: [...source.materials, { id: 'material-folder', courseId: 'course-cog', folderId: 'folder-child', title: 'Folder material', kind: 'file' as const, reference: '~/notes.pdf' }],
    notes: [...source.notes, { id: 'note-folder', title: 'Folder note', body: 'Keep the note, remove only its folder target.', folderId: 'folder-child', pinned: false, updatedAt: '2026-08-13T12:00:00.000Z' }],
  };
  const folderRemoved = removeFolderBranch(withNestedFolder, 'folder-root');
  assert.equal(folderRemoved.folders.length, 0);
  assert.equal(folderRemoved.materials.find((material) => material.id === 'material-folder')?.folderId, undefined);
  assert.equal(folderRemoved.notes.find((note) => note.id === 'note-folder')?.folderId, undefined);
});

test('rejects cross-course folder, material, and note attachments', () => {
  const source = sampleWorkspace();
  assert.equal(parseWorkspace({
    ...source,
    folders: source.folders.map((folder) => folder.id === 'folder-lectures' ? { ...folder, topicId: 'topic-regression' } : folder),
  }), null);
  assert.equal(parseWorkspace({
    ...source,
    materials: source.materials.map((material) => material.id === 'mat-memory' ? { ...material, folderId: 'folder-lectures', courseId: 'course-stat' } : material),
  }), null);
  assert.equal(parseWorkspace({
    ...source,
    notes: [...source.notes, { id: 'cross-course-note', title: 'Invalid', body: 'Invalid target', courseId: 'course-stat', folderId: 'folder-lectures', pinned: false, updatedAt: '2026-08-13T12:00:00.000Z' }],
  }), null);
});