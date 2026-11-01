import { generateMockHistory } from '@/data/mock/mockDataGenerator';
import { getMockSleepTruth } from '@/data/mock/mockTruth';
import { dropMissingHeartRates } from '@/data/syncFilters';
import { detectSleepSession } from '@/scoring/sleepEstimator';
import { addDaysTs, localTimeOn, MS_PER_MINUTE, startOfDayTs } from '@/utils/time';

const SEEDS = [42, 7, 20261101];
const NOW = new Date(2026, 9, 15, 20, 0).getTime();
const THIRTY_MINUTES = 30 * MS_PER_MINUTE;

describe('detectSleepSession', () => {
  it.each(SEEDS)('finds a session within 30 minutes of the hidden truth (seed %i)', (seed) => {
    const history = generateMockHistory({ seed, now: NOW, days: 60 });
    const heartRates = dropMissingHeartRates(history.heartRates);
    const today = startOfDayTs(NOW);

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
      const truth = getMockSleepTruth(seed, dayStart);

      expect(session).not.toBeNull();
      expect(Math.abs((session?.bedtime ?? 0) - truth.start)).toBeLessThanOrEqual(THIRTY_MINUTES);
      expect(Math.abs((session?.wakeTime ?? 0) - truth.end)).toBeLessThanOrEqual(THIRTY_MINUTES);
    }
  });

  it('returns null for a day with no long still period', () => {
    const windowStart = new Date(2026, 9, 14, 18).getTime();
    const windowEnd = new Date(2026, 9, 15, 14).getTime();
    const heartRates = [];
    const steps = [];
    // Awake the whole time: a steady heart rate, with steps in every 15-minute bucket.
    for (let ts = windowStart; ts < windowEnd; ts += 5 * MS_PER_MINUTE) {
      heartRates.push({ ts, bpm: 70 });
    }
    for (let start = windowStart; start < windowEnd; start += 15 * MS_PER_MINUTE) {
      steps.push({ start, steps: 40, calories: 1.6, distanceMeters: 30 });
    }
    expect(detectSleepSession({ heartRates, steps, windowStart, windowEnd })).toBeNull();
  });
});
