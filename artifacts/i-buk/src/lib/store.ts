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
  return d.toISOString().slice(0, 10);
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

export const loadWorkspace = (): Workspace => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as Workspace;
  } catch { /* a fresh workspace is a safe fallback */ }
  const fresh = sampleWorkspace();
  localStorage.setItem(key, JSON.stringify(fresh));
  return fresh;
};

export const saveWorkspace = (workspace: Workspace) => localStorage.setItem(key, JSON.stringify(workspace));
export const newId = id;
export const storageKey = key;