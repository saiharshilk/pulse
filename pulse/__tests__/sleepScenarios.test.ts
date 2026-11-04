import { detectSleepSession } from '@/scoring/sleepEstimator';
import type { HeartRateSample, StepSample } from '@/types/raw';
import { MS_PER_HOUR, MS_PER_MINUTE } from '@/utils/time';

const WINDOW_START = new Date(2026, 9, 14, 18).getTime();
const WINDOW_END = new Date(2026, 9, 15, 14).getTime();
const at = (hours: number, minutes = 0) => new Date(2026, 9, 14, 18 + hours, minutes).getTime();

type Span = { start: number; end: number };

// Builds a night: awake (70 bpm, steps) except while asleep (50 bpm, no steps).
// `wakeUps` are awake moments inside the night; `charging` has no readings and no steps at all.
function makeNight(sleep: Span | null, wakeUps: Span[] = [], charging: Span | null = null) {
  const inside = (ts: number, span: Span | null) => span !== null && ts >= span.start && ts < span.end;
  const asleepAt = (ts: number) => inside(ts, sleep) && !wakeUps.some((w) => inside(ts, w));
  const heartRates: HeartRateSample[] = [];
  const steps: StepSample[] = [];
  for (let ts = WINDOW_START; ts < WINDOW_END; ts += 5 * MS_PER_MINUTE) {
    if (!inside(ts, charging)) heartRates.push({ ts, bpm: asleepAt(ts) ? 50 : 70 });
  }
  for (let start = WINDOW_START; start < WINDOW_END; start += 15 * MS_PER_MINUTE) {
    const end = start + 15 * MS_PER_MINUTE;
    const fullyAsleep = asleepAt(start) && asleepAt(end - 5 * MS_PER_MINUTE) && asleepAt(start + 5 * MS_PER_MINUTE);
    const charged = inside(start, charging);
    steps.push({ start, steps: fullyAsleep || charged ? 0 : 40, calories: 0, distanceMeters: 0 });
  }
  return detectSleepSession({ heartRates, steps, windowStart: WINDOW_START, windowEnd: WINDOW_END });
}

describe('sleep estimator scenarios', () => {
  it('finds a normal night', () => {
    const session = makeNight({ start: at(5), end: at(13) }); // 23:00 → 07:00
    expect(session?.timeInBedMs).toBeCloseTo(8 * MS_PER_HOUR, -6);
    expect(session?.awakeIntervals).toEqual([]);
    expect(session?.efficiency).toBe(100);
  });

  it('finds a short night', () => {
    const session = makeNight({ start: at(6, 30), end: at(11, 30) }); // 00:30 → 05:30
    expect(Math.abs((session?.timeInBedMs ?? 0) - 5 * MS_PER_HOUR)).toBeLessThanOrEqual(10 * MS_PER_MINUTE);
  });

  it('keeps a fragmented night together and counts the wake-ups', () => {
    const wakeUps = [
      { start: at(7), end: at(7, 10) },
      { start: at(9), end: at(9, 10) },
      { start: at(11), end: at(11, 10) },
    ];
    const session = makeNight({ start: at(5), end: at(13) }, wakeUps);
    expect(session?.awakeIntervals).toHaveLength(3);
    expect(session?.efficiency).toBeLessThan(100);
    expect(Math.abs((session?.timeInBedMs ?? 0) - 8 * MS_PER_HOUR)).toBeLessThanOrEqual(10 * MS_PER_MINUTE);
  });

  it('returns null when there is no sleep', () => {
    expect(makeNight(null)).toBeNull();
  });

  it('returns null for a still period shorter than 3 hours', () => {
    expect(makeNight({ start: at(5), end: at(7, 30) })).toBeNull();
  });

  it('is not fooled by an afternoon charging gap', () => {
    // No readings and no steps for two hours in the evening must not count as sleep.
    const session = makeNight({ start: at(5), end: at(13) }, [], { start: at(1), end: at(3) });
    expect(Math.abs((session?.bedtime ?? 0) - at(5))).toBeLessThanOrEqual(15 * MS_PER_MINUTE);
  });
});
