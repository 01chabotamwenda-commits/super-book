export const APP_TIME_ZONE = 'Africa/Lusaka';

type ZonedParts = {
  date: string;
  hour: number;
  minute: number;
  second: number;
};

const getPart = (parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) =>
  Number(parts.find((part) => part.type === type)?.value ?? 0);

const zonedParts = (value: Date): ZonedParts => {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(value);
  const year = getPart(parts, 'year');
  const month = getPart(parts, 'month');
  const day = getPart(parts, 'day');

  return {
    date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    hour: getPart(parts, 'hour'),
    minute: getPart(parts, 'minute'),
    second: getPart(parts, 'second'),
  };
};

const dayOrdinal = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
};

const timeToMinutes = (time: string) => {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
};

export const dateKey = (value = new Date()) => zonedParts(value).date;

export const addDays = (date: string, amount: number) => {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + amount);
  return value.toISOString().slice(0, 10);
};

export const daysUntil = (date: string, referenceDate = dateKey()) =>
  dayOrdinal(date) - dayOrdinal(referenceDate);

export const minutesUntil = (date: string, time: string, value = new Date()) => {
  const now = zonedParts(value);
  const dayDelta = dayOrdinal(date) - dayOrdinal(now.date);
  return dayDelta * 1440 + timeToMinutes(time) - (now.hour * 60 + now.minute + now.second / 60);
};

const formatClockTime = (time: string) => {
  const [rawHour, rawMinute] = time.split(':').map(Number);
  const hour = rawHour % 12 || 12;
  const period = rawHour >= 12 ? 'pm' : 'am';
  return `${hour}:${String(rawMinute).padStart(2, '0')} ${period}`;
};

export const formatFocusTiming = (date: string, time: string, value = new Date()) => {
  const minutes = minutesUntil(date, time, value);
  if (minutes <= 0) return null;
  if (minutes <= 60) return `in ${Math.max(1, Math.ceil(minutes))} min`;

  const currentDate = dateKey(value);
  const relativeDay = daysUntil(date, currentDate);
  const dayLabel = relativeDay === 0
    ? 'today'
    : relativeDay === 1
      ? 'tomorrow'
      : new Intl.DateTimeFormat('en', { timeZone: APP_TIME_ZONE, month: 'short', day: 'numeric' })
        .format(new Date(`${date}T12:00:00Z`));

  return `${dayLabel} ${formatClockTime(time)}`;
};

export const greetingFor = (value = new Date()) => {
  const hour = zonedParts(value).hour;
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
};