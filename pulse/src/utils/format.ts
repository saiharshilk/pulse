// Turns numbers and timestamps into the exact strings screens display.
import { differenceInCalendarDays, format } from 'date-fns';

import { addDaysTs, dayKeyOf, MS_PER_MINUTE } from './time';

export const NO_VALUE = '—';

// 12345 → "12,345"
export function formatNumber(value: number): string {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 26460000 ms → "7:21" (hours:minutes)
export function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / MS_PER_MINUTE);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}`;
}

// → "11:42 PM"
export function formatClockTime(ts: number): string {
  return format(ts, 'h:mm a');
}

// → "11:42 PM – 7:18 AM"
export function formatTimeRange(start: number, end: number): string {
  return `${formatClockTime(start)} – ${formatClockTime(end)}`;
}

// → "12.4"
export function formatStrain(value: number): string {
  return value.toFixed(1);
}

// → "TODAY", "YESTERDAY" or "MON, OCT 26"
export function formatDayLabel(dayStart: number, now: number): string {
  const key = dayKeyOf(dayStart);
  if (key === dayKeyOf(now)) return 'TODAY';
  if (key === dayKeyOf(addDaysTs(now, -1))) return 'YESTERDAY';
  return format(dayStart, 'EEE, MMM d').toUpperCase();
}

// → "just now", "12 min ago", "3 hr ago"
export function formatTimeAgo(ts: number, now: number): string {
  const minutes = Math.floor((now - ts) / MS_PER_MINUTE);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  return `${Math.floor(minutes / 60)} hr ago`;
}

// → "M" (a weekday's first letter, for chart labels)
export function formatWeekdayLetter(ts: number): string {
  return format(ts, 'EEEEE');
}

// → "OCT 3"
export function formatShortDate(ts: number): string {
  return format(ts, 'MMM d').toUpperCase();
}

// → "88%", or "—" when there's no value
export function formatPercent(value: number | null): string {
  return value === null ? NO_VALUE : `${Math.round(value)}%`;
}

// → "52 bpm", or "—" when there's no value
export function formatBpm(value: number | null): string {
  return value === null ? NO_VALUE : `${Math.round(value)} bpm`;
}

// → "today", "yesterday" or "3 days ago", by calendar day
export function formatDaysAgo(ts: number, now: number): string {
  const days = differenceInCalendarDays(now, ts);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

// → "MON, OCT 26 · 9:41 AM"
export function formatDayAndTime(ts: number): string {
  return `${format(ts, 'EEE, MMM d').toUpperCase()} · ${formatClockTime(ts)}`;
}

// → "Synced just now", "Last synced 2 min ago", "Last synced 3 hr ago", "Last synced 2 days ago"
export function formatLastSynced(ts: number | null, now: number): string {
  if (ts === null) return 'Not synced yet';
  const minutes = Math.floor((now - ts) / MS_PER_MINUTE);
  if (minutes < 1) return 'Synced just now';
  if (minutes < 60) return `Last synced ${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Last synced ${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `Last synced ${days} ${days === 1 ? 'day' : 'days'} ago`;
}
