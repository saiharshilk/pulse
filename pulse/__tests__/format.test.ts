import { formatClockTime, formatDayLabel, formatDuration, formatNumber } from '@/utils/format';
import { MS_PER_HOUR, MS_PER_MINUTE } from '@/utils/time';

describe('format helpers', () => {
  it('formats durations', () => {
    expect(formatDuration(7 * MS_PER_HOUR + 21 * MS_PER_MINUTE)).toBe('7:21');
    expect(formatDuration(5 * MS_PER_MINUTE)).toBe('0:05');
  });

  it('formats clock times', () => {
    expect(formatClockTime(new Date(2026, 9, 15, 23, 42).getTime())).toBe('11:42 PM');
  });

  it('formats numbers with separators', () => {
    expect(formatNumber(12345)).toBe('12,345');
    expect(formatNumber(999)).toBe('999');
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('labels days', () => {
    const now = new Date(2026, 9, 28, 12).getTime();
    expect(formatDayLabel(new Date(2026, 9, 28).getTime(), now)).toBe('TODAY');
    expect(formatDayLabel(new Date(2026, 9, 27).getTime(), now)).toBe('YESTERDAY');
    expect(formatDayLabel(new Date(2026, 9, 26).getTime(), now)).toBe('MON, OCT 26');
  });
});
