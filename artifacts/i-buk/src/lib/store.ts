export type Course = { id: string; code: string; name: string; color: string };
export type Topic = {
  id: string; courseId: string; parentId?: string; title: string; minutes: number;
  lastStudied?: string; status: 'active' | 'done'; important: boolean;
};
export type Material = { id: string; courseId: string; topicId?: string; title: string; kind: 'file' | 'link'; reference: string };
export type Exam = { id: string; courseId: string; title: string; date: string; time?: string; complete: boolean };
export type Session = { id: string; topicId: string; date: string; minutes: number; note?: string };
export type Note = { id: string; title: string; body: string; reminder?: string; courseId?: string; topicId?: string; pinned: boolean; updatedAt: string };
export type Availability = { days: number[]; start: string; end: string; dailyMinutes: number };
export type Workspace = {
  version: number; profile: { name: string };
  courses: Course[]; topics: Topic[]; materials: Material[]; exams: Exam[]; sessions: Session[]; notes: Note[];
  availability: Availability;
};

const key = 'ibuk-workspace-v1';
const isoDay = (offset: number) => {
  const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const sampleWorkspace = (): Workspace => ({
  version: 1,
  profile: { name: 'Mara' },
  courses: [
    { id: 'course-cog', code: 'PSY 204', name: 'Cognitive Psychology', color: '#d5835d' },
    { id: 'course-stat', code: 'STA 210', name: 'Statistics for Behavioural Science', color: '#2e7467' },
    { id: 'course-neuro', code: 'BIO 118', name: 'Foundations of Neuroscience', color: '#b99352' },
  ],
  topics: [
    { id: 'topic-memory', courseId: 'course-cog', title: 'Memory systems', minutes: 45, lastStudied: isoDay(-5), status: 'active', important: true },
    { id: 'topic-attention', courseId: 'course-cog', title: 'Attention & perception', minutes: 35, lastStudied: isoDay(-2), status: 'active', important: true },
    { id: 'topic-research', courseId: 'course-cog', parentId: 'topic-memory', title: 'Research methods', minutes: 30, status: 'active', important: false },
    { id: 'topic-regression', courseId: 'course-stat', title: 'Linear regression', minutes: 50, lastStudied: isoDay(-10), status: 'active', important: true },
    { id: 'topic-probability', courseId: 'course-stat', title: 'Probability foundations', minutes: 40, lastStudied: isoDay(-3), status: 'active', important: false },
    { id: 'topic-neurons', courseId: 'course-neuro', title: 'Neural signalling', minutes: 45, status: 'active', important: true },
  ],
  materials: [
    { id: 'mat-memory', courseId: 'course-cog', topicId: 'topic-memory', title: 'Memory systems — lecture notes', kind: 'file', reference: '~/Documents/uni/psy204/memory-notes.pdf' },
    { id: 'mat-regression', courseId: 'course-stat', topicId: 'topic-regression', title: 'Week 7 reading', kind: 'link', reference: 'https://openstax.org/details/books/introductory-statistics' },
  ],
  exams: [
    { id: 'exam-cog', courseId: 'course-cog', title: 'Cognitive Psychology final', date: isoDay(11), complete: false },
    { id: 'exam-stat', courseId: 'course-stat', title: 'Statistics midterm', date: isoDay(18), complete: false },
    { id: 'exam-neuro', courseId: 'course-neuro', title: 'Neuroscience final', date: isoDay(26), complete: false },
  ],
  sessions: [
    { id: 'session-1', topicId: 'topic-memory', date: isoDay(-5), minutes: 42, note: 'Encoding and retrieval cues' },
    { id: 'session-2', topicId: 'topic-attention', date: isoDay(-2), minutes: 30 },
    { id: 'session-3', topicId: 'topic-probability', date: isoDay(-3), minutes: 38 },
    { id: 'session-4', topicId: 'topic-regression', date: isoDay(-10), minutes: 46 },
  ],
  notes: [
    { id: 'note-1', title: 'Ask about the Stroop replication', body: 'Bring the question about response inhibition to Thursday’s seminar.', reminder: isoDay(2), pinned: true, updatedAt: new Date().toISOString() },
    { id: 'note-2', title: 'Small win', body: 'The regression assumptions finally feel less slippery.', pinned: false, updatedAt: new Date().toISOString() },
  ],
  availability: { days: [1, 2, 3, 4, 5], start: '16:00', end: '20:00', dailyMinutes: 120 },
});

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const isString = (value: unknown): value is string => typeof value === 'string';
const isFinitePositive = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0;

export const parseWorkspace = (value: unknown): Workspace | null => {
  if (!isRecord(value) || !Array.isArray(value.courses) || !Array.isArray(value.topics) || !Array.isArray(value.exams)) return null;
  const courses = value.courses;
  const topics = value.topics;
  const exams = value.exams;
  if (!courses.every((item) => isRecord(item) && isString(item.id) && isString(item.code) && isString(item.name) && isString(item.color))) return null;
  if (!topics.every((item) => isRecord(item) && isString(item.id) && isString(item.courseId) && isString(item.title) && isFinitePositive(item.minutes) && (item.status === 'active' || item.status === 'done') && typeof item.important === 'boolean' && (item.parentId === undefined || isString(item.parentId)) && (item.lastStudied === undefined || isString(item.lastStudied)))) return null;
  if (!exams.every((item) => isRecord(item) && isString(item.id) && isString(item.courseId) && isString(item.title) && isString(item.date) && typeof item.complete === 'boolean' && (item.time === undefined || isString(item.time)))) return null;

  const materials = value.materials ?? [];
  const sessions = value.sessions ?? [];
  const notes = value.notes ?? [];
  const profile = value.profile;
  const availability = value.availability;
  if (!Array.isArray(materials) || !materials.every((item) => isRecord(item) && isString(item.id) && isString(item.courseId) && isString(item.title) && (item.kind === 'file' || item.kind === 'link') && isString(item.reference) && (item.topicId === undefined || isString(item.topicId)))) return null;
  if (!Array.isArray(sessions) || !sessions.every((item) => isRecord(item) && isString(item.id) && isString(item.topicId) && isString(item.date) && isFinitePositive(item.minutes) && (item.note === undefined || isString(item.note)))) return null;
  if (!Array.isArray(notes) || !notes.every((item) => isRecord(item) && isString(item.id) && isString(item.title) && isString(item.body) && typeof item.pinned === 'boolean' && isString(item.updatedAt) && (item.reminder === undefined || isString(item.reminder)) && (item.courseId === undefined || isString(item.courseId)) && (item.topicId === undefined || isString(item.topicId)))) return null;
  if (!isRecord(profile) || !isString(profile.name) || !isRecord(availability) || !Array.isArray(availability.days) || !availability.days.every((day) => typeof day === 'number' && Number.isInteger(day) && day >= 0 && day <= 6) || !isString(availability.start) || !isString(availability.end) || !isFinitePositive(availability.dailyMinutes)) return null;

  return {
    version: 1,
    profile: { name: profile.name },
    courses: courses as Course[],
    topics: topics as Topic[],
    materials: materials as Material[],
    exams: exams as Exam[],
    sessions: sessions as Session[],
    notes: notes as Note[],
    availability: {
      days: availability.days as number[],
      start: availability.start,
      end: availability.end,
      dailyMinutes: availability.dailyMinutes,
    },
  };
};

export const loadWorkspace = (): Workspace => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = parseWorkspace(JSON.parse(raw));
      if (parsed) return parsed;
    }
  } catch { /* a fresh workspace is a safe fallback */ }
  const fresh = sampleWorkspace();
  localStorage.setItem(key, JSON.stringify(fresh));
  return fresh;
};

export const saveWorkspace = (workspace: Workspace) => localStorage.setItem(key, JSON.stringify(workspace));
export const newId = id;
export const storageKey = key;