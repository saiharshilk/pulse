import { addDays, format, startOfDay } from 'date-fns';

export const MS_PER_MINUTE = 60_000;
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;
export const MS_PER_DAY = 24 * MS_PER_HOUR;
export const MINUTES_PER_DAY = 1440;

// 'yyyy-MM-dd' in the phone's local time.
export function dayKeyOf(ts: number): string {
  return format(ts, 'yyyy-MM-dd');
}

export function startOfDayTs(ts: number): number {
  return startOfDay(ts).getTime();
}

// The local midnight `days` days away. date-fns handles daylight-saving days correctly.
export function addDaysTs(dayStart: number, days: number): number {
  return addDays(dayStart, days).getTime();
}

// A local clock time on a day, e.g. localTimeOn(dayStart, -1, 18) = 18:00 the day before.
export function localTimeOn(dayStart: number, dayOffset: number, hours: number, minutes = 0): number {
  const date = addDays(dayStart, dayOffset);
  date.setHours(hours, minutes, 0, 0);
  return date.getTime();
}

// Minutes since local midnight (0–1439), used to compare clock times across days.
export function minuteOfDay(ts: number): number {
  const date = new Date(ts);
  return date.getHours() * 60 + date.getMinutes();
}

// Smallest gap between two clock times, so 23:50 and 00:10 are 20 minutes apart.
export function clockDiffMinutes(minuteA: number, minuteB: number): number {
  const diff = Math.abs(minuteA - minuteB) % MINUTES_PER_DAY;
  return Math.min(diff, MINUTES_PER_DAY - diff);
}
