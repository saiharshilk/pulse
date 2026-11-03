import {
  addToStats,
  averageOfStats,
  EMPTY_STATS,
  isValidSpO2,
  liveZoneLabel,
  median,
  sessionStats,
  spo2Outcome,
  trimToWindow,
  validSpO2Readings,
} from '@/features/live/liveMath';

describe('median', () => {
  it('handles odd, even and empty lists', () => {
    expect(median([97, 95, 99])).toBe(97);
    expect(median([96, 98, 95, 99])).toBe(97);
    expect(median([])).toBeNull();
  });
});

describe('zone labels', () => {
  // Resting 50, max 190: Zone 1 starts at 120 bpm (hrr 0.50), Zone 5 at 176 bpm (hrr 0.90).
  it('labels resting and every zone', () => {
    expect(liveZoneLabel(72, 50, 190)).toBe('Resting');
    expect(liveZoneLabel(120, 50, 190)).toBe('Zone 1');
    expect(liveZoneLabel(135, 50, 190)).toBe('Zone 2');
    expect(liveZoneLabel(150, 50, 190)).toBe('Zone 3');
    expect(liveZoneLabel(165, 50, 190)).toBe('Zone 4');
    expect(liveZoneLabel(180, 50, 190)).toBe('Zone 5');
  });
});

describe('session stats', () => {
  it('tracks min, max and average', () => {
    const stats = sessionStats([72, 68, 80]);
    expect(stats.min).toBe(68);
    expect(stats.max).toBe(80);
    expect(averageOfStats(stats)).toBeCloseTo(73.33, 1);
  });

  it('grows one reading at a time and is empty at the start', () => {
    expect(averageOfStats(EMPTY_STATS)).toBeNull();
    expect(addToStats(sessionStats([70]), 74)).toEqual(sessionStats([70, 74]));
  });
});

describe('SpO2 spot checks', () => {
  it('ignores readings outside 70–100', () => {
    expect([69, 70, 97, 100, 101].map(isValidSpO2)).toEqual([false, true, true, true, false]);
    expect(validSpO2Readings([0, 96, 255, 98])).toEqual([96, 98]);
  });

  it('keeps measuring until the 30-second window ends', () => {
    expect(spo2Outcome([97, 98], 12_000)).toEqual({ kind: 'measuring' });
  });

  it('reports the median of valid readings after 30 seconds', () => {
    expect(spo2Outcome([97, 0, 96, 98, 120], 30_000)).toEqual({ kind: 'result', percent: 97 });
  });

  it('waits past 30 seconds for a first valid reading, then fails at 40', () => {
    expect(spo2Outcome([0, 0], 35_000)).toEqual({ kind: 'measuring' });
    expect(spo2Outcome([0, 0], 40_000)).toEqual({ kind: 'failed' });
    expect(spo2Outcome([], 40_000)).toEqual({ kind: 'failed' });
  });
});

describe('trimToWindow', () => {
  it('keeps the last 60 seconds', () => {
    const readings = [0, 30_000, 70_000, 100_000].map((ts) => ({ ts, value: 70 }));
    expect(trimToWindow(readings, 100_000, 60_000).map((r) => r.ts)).toEqual([70_000, 100_000]);
  });
});
