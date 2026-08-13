import type { Course, Session, Topic, Workspace } from './store';

export type Recommendation = { topic: Topic; course: Course; reason: string; score: number };
export type StudyBlock = {
  date: string;
  start: string;
  end: string;
  minutes: number;
  courseId: string;
  topicId: string;
  topicTitle: string;
  courseCode: string;
  reason: string;
};
export type TopicStudySummary = {
  topicId: string;
  courseId: string;
  totalMinutes: number;
  eventCount: number;
  lastStudied?: string;
};
export type CourseStudySummary = {
  courseId: string;
  totalMinutes: number;
  eventCount: number;
  topicsStudied: number;
};

export const dateKey = (value = new Date()) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const addDays = (date: string, amount: number) => {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + amount);
  return value.toISOString().slice(0, 10);
};

export const daysUntil = (date: string, referenceDate = dateKey()) =>
  Math.round((new Date(`${date}T12:00:00`).getTime() - new Date(`${referenceDate}T12:00:00`).getTime()) / 86400000);

export const minutesBetween = (start: string, end: string) => {
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  return Math.max(0, (endHour * 60 + endMinute) - (startHour * 60 + startMinute));
};

const asMinutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
const asTime = (minutes: number) => `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

export const sessionDate = (session: Session) => session.date || session.startedAt.slice(0, 10);

export const topicSummaries = (workspace: Workspace): TopicStudySummary[] =>
  workspace.topics.map((topic) => {
    const sessions = workspace.sessions.filter((session) => session.topicId === topic.id);
    const lastStudied = sessions.map(sessionDate).sort().at(-1);
    return {
      topicId: topic.id,
      courseId: topic.courseId,
      totalMinutes: sessions.reduce((total, session) => total + session.durationMinutes, 0),
      eventCount: sessions.length,
      lastStudied,
    };
  });

export const courseSummaries = (workspace: Workspace): CourseStudySummary[] => {
  const topicById = new Map(workspace.topics.map((topic) => [topic.id, topic]));
  return workspace.courses.map((course) => {
    const sessions = workspace.sessions.filter((session) => session.courseId === course.id || topicById.get(session.topicId)?.courseId === course.id);
    return {
      courseId: course.id,
      totalMinutes: sessions.reduce((total, session) => total + session.durationMinutes, 0),
      eventCount: sessions.length,
      topicsStudied: new Set(sessions.map((session) => session.topicId)).size,
    };
  });
};

export const recommendations = (workspace: Workspace, dayOffset: number, referenceDate = dateKey()): Recommendation[] => {
  const target = addDays(referenceDate, dayOffset);
  const targetDay = new Date(`${target}T12:00:00`).getDay();
  const capacity = Math.min(workspace.availability.dailyMinutes, minutesBetween(workspace.availability.start, workspace.availability.end));
  if (!capacity || !workspace.availability.days.includes(targetDay)) return [];
  const summaries = new Map(topicSummaries(workspace).map((summary) => [summary.topicId, summary]));
  const recentMinutesByCourse = new Map<string, number>();
  workspace.sessions.forEach((session) => {
    if (daysUntil(sessionDate(session), referenceDate) >= -7) {
      recentMinutesByCourse.set(session.courseId, (recentMinutesByCourse.get(session.courseId) ?? 0) + session.durationMinutes);
    }
  });
  return workspace.topics
    .filter((topic) => topic.status !== 'done')
    .map((topic) => {
      const course = workspace.courses.find((item) => item.id === topic.courseId);
      if (!course) return null;
      const summary = summaries.get(topic.id);
      const exam = workspace.exams.find((item) => item.courseId === topic.courseId && !item.complete);
      const rawDue = exam ? daysUntil(exam.date, referenceDate) - dayOffset : 60;
      const stale = summary?.lastStudied ? Math.max(0, daysUntil(summary.lastStudied, target)) : 14;
      const urgency = exam ? (rawDue <= 0 ? 34 : Math.max(0, 34 - Math.max(1, rawDue) * 1.8)) : 0;
      const freshness = summary?.lastStudied ? Math.min(20, stale * 1.5) : 22;
      const balance = Math.min(10, (recentMinutesByCourse.get(topic.courseId) ?? 0) / 30);
      const score = urgency + freshness + (topic.important ? 8 : 0) - balance - Math.max(0, topic.minutes - capacity) * 0.25;
       const examReason = exam ? (rawDue < 0 ? `${exam.title} ${Math.abs(rawDue)} days overdue` : rawDue === 0 ? `${exam.title} today` : `${exam.title} in ${rawDue} days`) : '';
      const reason = exam && rawDue < 14 ? examReason : summary?.lastStudied ? `last studied ${Math.max(1, stale)} days ago` : 'not studied yet';
      return { topic, course, reason, score };
    })
    .filter((item): item is Recommendation => item !== null)
    .sort((a, b) => b.score - a.score);
};

export const buildScheduleBlocks = (workspace: Workspace, horizonDays = 7, referenceDate = dateKey()): StudyBlock[] => {
  const blocks: StudyBlock[] = [];
  for (let dayOffset = 0; dayOffset < horizonDays; dayOffset += 1) {
    const date = addDays(referenceDate, dayOffset);
    const day = new Date(`${date}T12:00:00`).getDay();
    if (!workspace.availability.days.includes(day)) continue;
    let cursor = asMinutes(workspace.availability.start);
    let remaining = Math.min(workspace.availability.dailyMinutes, minutesBetween(workspace.availability.start, workspace.availability.end));
    recommendations(workspace, dayOffset, referenceDate).forEach((recommendation) => {
      if (remaining <= 0) return;
      const minutes = Math.min(remaining, recommendation.topic.minutes);
      if (minutes < 5) return;
      blocks.push({
        date,
        start: asTime(cursor),
        end: asTime(cursor + minutes),
        minutes,
        courseId: recommendation.course.id,
        topicId: recommendation.topic.id,
        topicTitle: recommendation.topic.title,
        courseCode: recommendation.course.code,
        reason: recommendation.reason,
      });
      cursor += minutes;
      remaining -= minutes;
    });
  }
  return blocks;
};