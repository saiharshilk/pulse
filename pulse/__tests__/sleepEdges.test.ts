import { generateMockHistory } from '@/data/mock/mockDataGenerator';
import { getMockSleepTruth } from '@/data/mock/mockTruth';
import { dropMissingHeartRates } from '@/data/syncFilters';
import { detectSleepSession } from '@/scoring/sleepEstimator';
import { addDaysTs, localTimeOn, MS_PER_MINUTE, startOfDayTs } from '@/utils/time';

const SEED = 42;
const NOW = new Date(2026, 9, 15, 20, 0).getTime();
const FIVE_MINUTES = 5 * MS_PER_MINUTE;
const FIFTEEN_MINUTES = 15 * MS_PER_MINUTE;

function nightlySessions() {
  const history = generateMockHistory({ seed: SEED, now: NOW, days: 60 });
  const heartRates = dropMissingHeartRates(history.heartRates);
  const today = startOfDayTs(NOW);
  const nights = [];
  for (let offset = -58; offset <= 0; offset++) {
    const dayStart = addDaysTs(today, offset);
    const windowStart = localTimeOn(dayStart, -1, 18);
    const windowEnd = localTimeOn(dayStart, 0, 14);
    const session = detectSleepSession({
      heartRates: heartRates.filter((s) => s.ts >= windowStart && s.ts < windowEnd),
      steps: history.steps.filter((b) => b.start >= windowStart && b.start < windowEnd),
      windowStart,
      windowEnd,
    });
    if (session !== null) nights.push({ session, truth: getMockSleepTruth(SEED, dayStart) });
  }
  return nights;
}

describe('sleep edge refinement', () => {
  it('moves most edges off the 15-minute grid', () => {
    const nights = nightlySessions();
    const edges = nights.flatMap(({ session }) => [session.bedtime, session.wakeTime]);
    const offGrid = edges.filter((ts) => ts % FIFTEEN_MINUTES !== 0);
    expect(offGrid.length / edges.length).toBeGreaterThan(0.75);
    expect(edges.every((ts) => ts % MS_PER_MINUTE === 0)).toBe(true);
  });

  it('lands close to the true times', () => {
    const nights = nightlySessions();
    const errors = nights.flatMap(({ session, truth }) => [
      Math.abs(session.bedtime - truth.start),
      Math.abs(session.wakeTime - truth.end),
    ]);
    const mean = errors.reduce((a, b) => a + b, 0) / errors.length;
    expect(mean).toBeLessThan(FIVE_MINUTES);
    expect(Math.max(...errors)).toBeLessThanOrEqual(FIFTEEN_MINUTES);
  });

  it('finds the crossing between two 5-minute samples', () => {
    const windowStart = new Date(2026, 9, 14, 18).getTime();
    const windowEnd = new Date(2026, 9, 15, 14).getTime();
    const sleepStart = new Date(2026, 9, 14, 23, 35).getTime(); // first asleep sample
    const sleepEnd = new Date(2026, 9, 15, 7, 5).getTime(); // first awake sample
    const heartRates = [];
    const steps = [];
    for (let ts = windowStart; ts < windowEnd; ts += FIVE_MINUTES) {
      heartRates.push({ ts, bpm: ts >= sleepStart && ts < sleepEnd ? 50 : 70 });
    }
    for (let start = windowStart; start < windowEnd; start += FIFTEEN_MINUTES) {
      // Buckets holding any awake time have a few steps, as they would on the real ring.
      const asleepWholeBucket = start >= sleepStart && start + FIFTEEN_MINUTES <= sleepEnd;
      steps.push({ start, steps: asleepWholeBucket ? 0 : 30, calories: 0, distanceMeters: 0 });
    }

    const session = detectSleepSession({ heartRates, steps, windowStart, windowEnd });
    // The threshold is 60 bpm, halfway from 70 to 50, so each crossing is halfway between samples.
    expect(session?.bedtime).toBe(new Date(2026, 9, 14, 23, 33).getTime());
    expect(session?.wakeTime).toBe(new Date(2026, 9, 15, 7, 3).getTime());
    expect(session?.timeInBedMs).toBe(450 * MS_PER_MINUTE);
  });
});
