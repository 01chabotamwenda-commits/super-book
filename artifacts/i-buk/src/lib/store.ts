import { addDays, dateKey } from './time.ts';

export const CURRENT_WORKSPACE_VERSION = 2;

export type Course = { id: string; code: string; name: string; color: string };
export type Topic = {
  id: string;
  courseId: string;
  parentId?: string;
  title: string;
  minutes: number;
  sortOrder: number;
  lastStudied?: string;
  status: 'active' | 'done';
  important: boolean;
};
export type Folder = {
  id: string;
  courseId: string;
  parentId?: string;
  topicId?: string;
  name: string;
  sortOrder: number;
};
export type Material = {
  id: string;
  courseId: string;
  topicId?: string;
  folderId?: string;
  title: string;
  kind: 'file' | 'link';
  reference: string;
};
export type Exam = { id: string; courseId: string; title: string; date: string; time?: string; complete: boolean };
export type Session = {
  id: string;
  courseId: string;
  topicId: string;
  date: string;
  minutes: number;
  durationMinutes: number;
  startedAt: string;
  endedAt?: string;
  source: 'manual' | 'quick-log';
  note?: string;
};
export type Note = {
  id: string;
  title: string;
  body: string;
  reminder?: string;
  courseId?: string;
  topicId?: string;
  folderId?: string;
  pinned: boolean;
  updatedAt: string;
};
export type Availability = { days: number[]; start: string; end: string; dailyMinutes: number };
export type Workspace = {
  version: number;
  updatedAt: string;
  profile: { name: string };
  courses: Course[];
  topics: Topic[];
  folders: Folder[];
  materials: Material[];
  exams: Exam[];
  sessions: Session[];
  notes: Note[];
  availability: Availability;
};

const key = 'ibuk-workspace-v1';
const emptyWorkspaceTimestamp = new Date(0).toISOString();
const isoDay = (offset: number) => addDays(dateKey(), offset);
const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const atNoon = (date: string) => `${date}T12:00:00`;
const atEnd = (date: string, minutes: number) => new Date(new Date(atNoon(date)).getTime() + minutes * 60000).toISOString();

export const emptyWorkspace = (): Workspace => ({
  version: CURRENT_WORKSPACE_VERSION,
  updatedAt: emptyWorkspaceTimestamp,
  profile: { name: 'Student' },
  courses: [],
  topics: [],
  folders: [],
  materials: [],
  exams: [],
  sessions: [],
  notes: [],
  availability: { days: [1, 2, 3, 4, 5], start: '16:00', end: '20:00', dailyMinutes: 120 },
});

export const sampleWorkspace = (): Workspace => ({
  version: CURRENT_WORKSPACE_VERSION,
  updatedAt: new Date().toISOString(),
  profile: { name: 'Mara' },
  courses: [
    { id: 'course-cog', code: 'PSY 204', name: 'Cognitive Psychology', color: '#d5835d' },
    { id: 'course-stat', code: 'STA 210', name: 'Statistics for Behavioural Science', color: '#2e7467' },
    { id: 'course-neuro', code: 'BIO 118', name: 'Foundations of Neuroscience', color: '#b99352' },
  ],
  topics: [
    { id: 'topic-memory', courseId: 'course-cog', title: 'Memory systems', minutes: 45, sortOrder: 0, lastStudied: isoDay(-5), status: 'active', important: true },
    { id: 'topic-attention', courseId: 'course-cog', title: 'Attention & perception', minutes: 35, sortOrder: 1, lastStudied: isoDay(-2), status: 'active', important: true },
    { id: 'topic-research', courseId: 'course-cog', parentId: 'topic-memory', title: 'Research methods', minutes: 30, sortOrder: 0, status: 'active', important: false },
    { id: 'topic-regression', courseId: 'course-stat', title: 'Linear regression', minutes: 50, sortOrder: 0, lastStudied: isoDay(-10), status: 'active', important: true },
    { id: 'topic-probability', courseId: 'course-stat', title: 'Probability foundations', minutes: 40, sortOrder: 1, lastStudied: isoDay(-3), status: 'active', important: false },
    { id: 'topic-neurons', courseId: 'course-neuro', title: 'Neural signalling', minutes: 45, sortOrder: 0, status: 'active', important: true },
  ],
  folders: [
    { id: 'folder-lectures', courseId: 'course-cog', name: 'Lecture notes', sortOrder: 0 },
  ],
  materials: [
    { id: 'mat-memory', courseId: 'course-cog', topicId: 'topic-memory', folderId: 'folder-lectures', title: 'Memory systems — lecture notes', kind: 'file', reference: '~/Documents/uni/psy204/memory-notes.pdf' },
    { id: 'mat-regression', courseId: 'course-stat', topicId: 'topic-regression', title: 'Week 7 reading', kind: 'link', reference: 'https://openstax.org/details/books/introductory-statistics' },
  ],
  exams: [
    { id: 'exam-cog', courseId: 'course-cog', title: 'Cognitive Psychology final', date: isoDay(11), complete: false },
    { id: 'exam-stat', courseId: 'course-stat', title: 'Statistics midterm', date: isoDay(18), complete: false },
    { id: 'exam-neuro', courseId: 'course-neuro', title: 'Neuroscience final', date: isoDay(26), complete: false },
  ],
  sessions: [
    { id: 'session-1', courseId: 'course-cog', topicId: 'topic-memory', date: isoDay(-5), minutes: 42, durationMinutes: 42, startedAt: atNoon(isoDay(-5)), endedAt: atEnd(isoDay(-5), 42), source: 'manual', note: 'Encoding and retrieval cues' },
    { id: 'session-2', courseId: 'course-cog', topicId: 'topic-attention', date: isoDay(-2), minutes: 30, durationMinutes: 30, startedAt: atNoon(isoDay(-2)), endedAt: atEnd(isoDay(-2), 30), source: 'manual' },
    { id: 'session-3', courseId: 'course-stat', topicId: 'topic-probability', date: isoDay(-3), minutes: 38, durationMinutes: 38, startedAt: atNoon(isoDay(-3)), endedAt: atEnd(isoDay(-3), 38), source: 'manual' },
    { id: 'session-4', courseId: 'course-stat', topicId: 'topic-regression', date: isoDay(-10), minutes: 46, durationMinutes: 46, startedAt: atNoon(isoDay(-10)), endedAt: atEnd(isoDay(-10), 46), source: 'manual' },
  ],
  notes: [
    { id: 'note-1', title: 'Ask about the Stroop replication', body: 'Bring the question about response inhibition to Thursday’s seminar.', reminder: isoDay(2), pinned: true, updatedAt: new Date().toISOString() },
    { id: 'note-2', title: 'Small win', body: 'The regression assumptions finally feel less slippery.', pinned: false, updatedAt: new Date().toISOString() },
  ],
  availability: { days: [1, 2, 3, 4, 5], start: '16:00', end: '20:00', dailyMinutes: 120 },
});

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const isString = (value: unknown): value is string => typeof value === 'string';
const isTimestamp = (value: unknown): value is string => isString(value) && Number.isFinite(Date.parse(value));
const isFinitePositive = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0;
const isValidTime = (value: unknown) => isString(value) && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
const isValidDate = (value: unknown) => {
  if (!isString(value) || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};
const timeMinutes = (value: string) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
type Parentable = { id: string; parentId?: string };
const hasParentCycle = <T extends Parentable>(items: T[]) => {
  const parentById = new Map(items.map((item) => [item.id, item.parentId]));
  return items.some((item) => {
    const visited = new Set<string>();
    let current: string | undefined = item.id;
    while (current) {
      if (visited.has(current)) return true;
      visited.add(current);
      current = parentById.get(current);
    }
    return false;
  });
};

const normalizeSession = (value: unknown, topics: Topic[]): Session | null => {
  if (!isRecord(value) || !isString(value.id) || !isString(value.topicId) || !isValidDate(value.date) || !isFinitePositive(value.minutes)) return null;
  const topic = topics.find((item) => item.id === value.topicId);
  if (!topic) return null;
  const date = value.date as string;
  const durationMinutes = isFinitePositive(value.durationMinutes) ? value.durationMinutes : value.minutes;
  const startedAt = isString(value.startedAt) ? value.startedAt : atNoon(date);
  return {
    id: value.id,
    courseId: topic.courseId,
    topicId: value.topicId,
    date,
    minutes: Math.round(value.minutes),
    durationMinutes: Math.round(durationMinutes),
    startedAt,
    endedAt: isString(value.endedAt) ? value.endedAt : atEnd(date, Math.round(durationMinutes)),
    source: value.source === 'quick-log' ? 'quick-log' : 'manual',
    note: isString(value.note) ? value.note : undefined,
  };
};

export const parseWorkspace = (value: unknown): Workspace | null => {
  if (!isRecord(value) || !Array.isArray(value.courses) || !Array.isArray(value.topics) || !Array.isArray(value.exams)) return null;
  const courses = value.courses;
  const courseById = new Map(courses.filter(isRecord).map((item) => [item.id, item]));
  const rawTopics = value.topics;
  const exams = value.exams;
  if (!courses.every((item) => isRecord(item) && isString(item.id) && isString(item.code) && isString(item.name) && isString(item.color))) return null;
    if (!rawTopics.every((item) => isRecord(item) && isString(item.id) && isString(item.courseId) && courseById.has(item.courseId) && isString(item.title) && isFinitePositive(item.minutes) && (item.status === 'active' || item.status === 'done') && typeof item.important === 'boolean' && (item.parentId === undefined || isString(item.parentId)) && (item.lastStudied === undefined || isValidDate(item.lastStudied)))) return null;
   if (!exams.every((item) => isRecord(item) && isString(item.id) && isString(item.courseId) && isString(item.title) && isValidDate(item.date) && typeof item.complete === 'boolean' && (item.time === undefined || isValidTime(item.time)))) return null;

  const topics = rawTopics.map((item, index) => ({
    id: item.id as string,
    courseId: item.courseId as string,
    parentId: isString(item.parentId) ? item.parentId : undefined,
    title: item.title as string,
    minutes: Math.round(item.minutes as number),
    sortOrder: typeof item.sortOrder === 'number' && Number.isFinite(item.sortOrder) ? item.sortOrder : index,
    lastStudied: isString(item.lastStudied) ? item.lastStudied : undefined,
    status: item.status as Topic['status'],
    important: item.important as boolean,
  }));
  const topicById = new Map(topics.map((topic) => [topic.id, topic]));
  if (topics.some((topic) => topic.parentId && (!topicById.has(topic.parentId) || topicById.get(topic.parentId)?.courseId !== topic.courseId)) || hasParentCycle(topics)) return null;
  const rawFolders = Array.isArray(value.folders) ? value.folders : [];
  if (!rawFolders.every((item) => isRecord(item) && isString(item.id) && isString(item.courseId) && isString(item.name) && (item.parentId === undefined || isString(item.parentId)) && (item.topicId === undefined || isString(item.topicId)))) return null;
  const folders = rawFolders.map((item, index) => ({
    id: item.id as string,
    courseId: item.courseId as string,
    parentId: isString(item.parentId) ? item.parentId : undefined,
    topicId: isString(item.topicId) ? item.topicId : undefined,
    name: item.name as string,
    sortOrder: typeof item.sortOrder === 'number' && Number.isFinite(item.sortOrder) ? item.sortOrder : index,
  }));
  const folderById = new Map(folders.map((folder) => [folder.id, folder]));
  if (folders.some((folder) => folder.parentId && (!folderById.has(folder.parentId) || folderById.get(folder.parentId)?.courseId !== folder.courseId)) || folders.some((folder) => folder.topicId && (!topicById.has(folder.topicId) || topicById.get(folder.topicId)?.courseId !== folder.courseId)) || hasParentCycle(folders)) return null;
  const rawMaterials = Array.isArray(value.materials) ? value.materials : [];
  const rawNotes = Array.isArray(value.notes) ? value.notes : [];
  const profile = value.profile;
  const availability = value.availability;
  if (!rawMaterials.every((item) => isRecord(item) && isString(item.id) && isString(item.courseId) && courseById.has(item.courseId) && isString(item.title) && (item.kind === 'file' || item.kind === 'link') && isString(item.reference) && (item.topicId === undefined || (isString(item.topicId) && topicById.get(item.topicId)?.courseId === item.courseId)) && (item.folderId === undefined || (isString(item.folderId) && folderById.get(item.folderId)?.courseId === item.courseId)))) return null;
  if (!rawNotes.every((item) => {
    if (!isRecord(item) || !isString(item.id) || !isString(item.title) || !isString(item.body) || typeof item.pinned !== 'boolean' || !isString(item.updatedAt) || (item.reminder !== undefined && !isString(item.reminder)) || (item.courseId !== undefined && (!isString(item.courseId) || !courseById.has(item.courseId))) || (item.topicId !== undefined && !isString(item.topicId)) || (item.folderId !== undefined && !isString(item.folderId))) return false;
    const topic = isString(item.topicId) ? topicById.get(item.topicId) : undefined;
    const folder = isString(item.folderId) ? folderById.get(item.folderId) : undefined;
    const targetCourseId = isString(item.courseId) ? item.courseId : undefined;
    return (!item.topicId || Boolean(topic && (!targetCourseId || topic.courseId === targetCourseId)))
      && (!item.folderId || Boolean(folder && (!targetCourseId || folder.courseId === targetCourseId)));
  })) return null;
  if (!isRecord(profile) || !isString(profile.name) || !isRecord(availability) || !Array.isArray(availability.days) || !availability.days.every((day) => typeof day === 'number' && Number.isInteger(day) && day >= 0 && day <= 6) || !isValidTime(availability.start) || !isValidTime(availability.end) || timeMinutes(availability.end as string) <= timeMinutes(availability.start as string) || !isFinitePositive(availability.dailyMinutes)) return null;
  const sessions = Array.isArray(value.sessions) ? value.sessions.map((item) => normalizeSession(item, topics)).filter((item): item is Session => item !== null) : [];
  if (Array.isArray(value.sessions) && sessions.length !== value.sessions.length) return null;

  return {
    version: CURRENT_WORKSPACE_VERSION,
    updatedAt: isTimestamp(value.updatedAt) ? value.updatedAt : '1970-01-01T00:00:00.000Z',
    profile: { name: profile.name },
    courses: courses as Course[],
    topics,
    folders,
    materials: rawMaterials as Material[],
    exams: exams as Exam[],
    sessions,
    notes: rawNotes as Note[],
    availability: {
      days: availability.days as number[],
      start: availability.start as string,
      end: availability.end as string,
      dailyMinutes: Math.round(availability.dailyMinutes as number),
    },
  };
};

export const loadWorkspace = (): Workspace => {
  if (typeof localStorage === 'undefined') return emptyWorkspace();
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const rawValue = JSON.parse(raw);
      const parsed = parseWorkspace(rawValue);
      if (parsed) {
        if (rawValue.version !== CURRENT_WORKSPACE_VERSION || !isTimestamp(rawValue.updatedAt)) saveWorkspace(parsed, { touch: false });
        return parsed;
      }
    }
  } catch { /* a fresh workspace is a safe fallback */ }
  return emptyWorkspace();
};

export const saveWorkspace = (workspace: Workspace, options: { touch?: boolean } = {}) => {
  const next = {
    ...workspace,
    version: CURRENT_WORKSPACE_VERSION,
    updatedAt: options.touch === false ? workspace.updatedAt : new Date().toISOString(),
  };
  if (typeof localStorage !== 'undefined') localStorage.setItem(key, JSON.stringify(next));
  return next;
};
export const newId = id;
export const storageKey = key;

export const topicDescendantIds = (workspace: Workspace, rootId: string): string[] => {
  const descendants: string[] = [];
  const visited = new Set([rootId]);
  const visit = (parentId: string) => {
    workspace.topics
      .filter((topic) => topic.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach((child) => {
        if (visited.has(child.id)) return;
        visited.add(child.id);
        descendants.push(child.id);
        visit(child.id);
      });
  };
  visit(rootId);
  return descendants;
};

export const canSetTopicParent = (workspace: Workspace, topicId: string, parentId?: string) => {
  if (!parentId) return true;
  const topic = workspace.topics.find((item) => item.id === topicId);
  const parent = workspace.topics.find((item) => item.id === parentId);
  return Boolean(topic && parent && topic.courseId === parent.courseId && parent.id !== topicId && !topicDescendantIds(workspace, topicId).includes(parent.id));
};

export const moveTopic = (workspace: Workspace, topicId: string, parentId?: string): Workspace | null => {
  if (!canSetTopicParent(workspace, topicId, parentId)) return null;
  const topic = workspace.topics.find((item) => item.id === topicId);
  if (!topic) return null;
  const siblings = workspace.topics.filter((item) => item.courseId === topic.courseId && item.parentId === parentId && item.id !== topicId);
  const sortOrder = siblings.length ? Math.max(...siblings.map((item) => item.sortOrder)) + 1 : 0;
  return { ...workspace, topics: workspace.topics.map((item) => item.id === topicId ? { ...item, parentId, sortOrder } : item) };
};

export const reorderTopic = (workspace: Workspace, topicId: string, direction: -1 | 1): Workspace => {
  const topic = workspace.topics.find((item) => item.id === topicId);
  if (!topic) return workspace;
  const siblings = workspace.topics.filter((item) => item.courseId === topic.courseId && item.parentId === topic.parentId).sort((a, b) => a.sortOrder - b.sortOrder);
  const index = siblings.findIndex((item) => item.id === topicId);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= siblings.length) return workspace;
  const next = siblings[nextIndex];
  return {
    ...workspace,
    topics: workspace.topics.map((item) => item.id === topic.id ? { ...item, sortOrder: next.sortOrder } : item.id === next.id ? { ...item, sortOrder: topic.sortOrder } : item),
  };
};

export const removeTopicBranch = (workspace: Workspace, topicId: string): Workspace => {
  const removed = new Set([topicId, ...topicDescendantIds(workspace, topicId)]);
  return {
    ...workspace,
    topics: workspace.topics.filter((topic) => !removed.has(topic.id)),
    folders: workspace.folders.map((folder) => folder.topicId && removed.has(folder.topicId) ? { ...folder, topicId: undefined } : folder),
    materials: workspace.materials.filter((material) => !material.topicId || !removed.has(material.topicId)),
    sessions: workspace.sessions.filter((session) => !removed.has(session.topicId)),
    notes: workspace.notes.map((note) => note.topicId && removed.has(note.topicId) ? { ...note, topicId: undefined } : note),
  };
};

export const folderDescendantIds = (workspace: Workspace, rootId: string): string[] => {
  const descendants: string[] = [];
  const visited = new Set([rootId]);
  const visit = (parentId: string) => {
    workspace.folders
      .filter((folder) => folder.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach((child) => {
        if (visited.has(child.id)) return;
        visited.add(child.id);
        descendants.push(child.id);
        visit(child.id);
      });
  };
  visit(rootId);
  return descendants;
};

export const canSetFolderParent = (workspace: Workspace, folderId: string, parentId?: string) => {
  if (!parentId) return true;
  const folder = workspace.folders.find((item) => item.id === folderId);
  const parent = workspace.folders.find((item) => item.id === parentId);
  return Boolean(folder && parent && folder.courseId === parent.courseId && folder.id !== parentId && !folderDescendantIds(workspace, folderId).includes(parent.id));
};

export const moveFolder = (workspace: Workspace, folderId: string, parentId?: string): Workspace | null => {
  if (!canSetFolderParent(workspace, folderId, parentId)) return null;
  const folder = workspace.folders.find((item) => item.id === folderId);
  if (!folder) return null;
  const siblings = workspace.folders.filter((item) => item.courseId === folder.courseId && item.parentId === parentId && item.id !== folderId);
  const sortOrder = siblings.length ? Math.max(...siblings.map((item) => item.sortOrder)) + 1 : 0;
  return { ...workspace, folders: workspace.folders.map((item) => item.id === folderId ? { ...item, parentId, sortOrder } : item) };
};

export const reorderFolder = (workspace: Workspace, folderId: string, direction: -1 | 1): Workspace => {
  const folder = workspace.folders.find((item) => item.id === folderId);
  if (!folder) return workspace;
  const siblings = workspace.folders.filter((item) => item.courseId === folder.courseId && item.parentId === folder.parentId).sort((a, b) => a.sortOrder - b.sortOrder);
  const index = siblings.findIndex((item) => item.id === folderId);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= siblings.length) return workspace;
  const next = siblings[nextIndex];
  return {
    ...workspace,
    folders: workspace.folders.map((item) => item.id === folder.id ? { ...item, sortOrder: next.sortOrder } : item.id === next.id ? { ...item, sortOrder: folder.sortOrder } : item),
  };
};

export const removeFolderBranch = (workspace: Workspace, folderId: string): Workspace => {
  const removed = new Set([folderId, ...folderDescendantIds(workspace, folderId)]);
  return {
    ...workspace,
    folders: workspace.folders.filter((folder) => !removed.has(folder.id)),
    materials: workspace.materials.map((material) => removed.has(material.folderId ?? '') ? { ...material, folderId: undefined } : material),
    notes: workspace.notes.map((note) => removed.has(note.folderId ?? '') ? { ...note, folderId: undefined } : note),
  };
};