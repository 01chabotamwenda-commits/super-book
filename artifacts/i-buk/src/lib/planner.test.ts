import assert from 'node:assert/strict';
import test from 'node:test';
import { buildScheduleBlocks, courseSummaries, recommendations, topicSummaries } from './planner.ts';
import { sampleWorkspace } from './store.ts';

test('study summaries aggregate repeated events by topic and course', () => {
  const workspace = sampleWorkspace();
  workspace.sessions.push({
    id: 'extra-session',
    courseId: 'course-cog',
    topicId: 'topic-memory',
    date: '2026-08-12',
    minutes: 20,
    durationMinutes: 20,
    startedAt: '2026-08-12T16:00:00',
    endedAt: '2026-08-12T16:20:00',
    source: 'quick-log',
  });

  const topic = topicSummaries(workspace).find((summary) => summary.topicId === 'topic-memory');
  const course = courseSummaries(workspace).find((summary) => summary.courseId === 'course-cog');
  assert.equal(topic?.totalMinutes, 62);
  assert.equal(topic?.eventCount, 2);
  assert.equal(topic?.lastStudied, '2026-08-12');
  assert.equal(course?.totalMinutes, 92);
  assert.equal(course?.topicsStudied, 2);
});

test('completed exams no longer add urgency to recommendations', () => {
  const source = sampleWorkspace();
  const workspace = {
    ...source,
    topics: [source.topics[0]!],
    courses: [source.courses[0]!],
    sessions: [],
    exams: [{ id: 'exam-only', courseId: 'course-cog', title: 'Exam', date: '2026-08-14', complete: false }],
  };
  const openScore = recommendations(workspace, 0, '2026-08-13')[0]?.score ?? 0;
  const completedScore = recommendations({
    ...workspace,
    exams: [{ ...workspace.exams[0]!, complete: true }],
  }, 0, '2026-08-13')[0]?.score ?? 0;
  assert.ok(openScore > completedScore);
});

test('generated blocks stay within available days, windows, and daily capacity', () => {
  const workspace = sampleWorkspace();
  workspace.availability = { days: [4], start: '16:00', end: '17:00', dailyMinutes: 60 };
  const blocks = buildScheduleBlocks(workspace, 3, '2026-08-13');
  assert.ok(blocks.length > 0);
  assert.ok(blocks.every((block) => block.date === '2026-08-13'));
  assert.ok(blocks.every((block) => block.start >= '16:00' && block.end <= '17:00'));
  assert.ok(blocks.reduce((total, block) => total + block.minutes, 0) <= 60);
});