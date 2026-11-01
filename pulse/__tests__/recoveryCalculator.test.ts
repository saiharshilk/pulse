import { calculateRecovery } from '@/scoring/recoveryCalculator';

const NIGHT = { restingHR: 50, averageSleepingHR: 55 };
// A little variation, so the baseline has a realistic spread.
const PRIOR_NIGHTS = [48, 49, 50, 51, 52, 50].map((restingHR) => ({
  restingHR,
  averageSleepingHR: restingHR + 5,
}));

describe('calculateRecovery', () => {
  it('is calibrating with fewer than 4 nights', () => {
    const result = calculateRecovery({ ...NIGHT, sleepPerformance: 90, priorNights: PRIOR_NIGHTS.slice(0, 3) });
    expect(result.isCalibrating).toBe(true);
    expect(result.score).toBeNull();
    expect(result.baseline).toBeNull();
  });

  it('scores higher for a lower resting heart rate', () => {
    const low = calculateRecovery({ ...NIGHT, restingHR: 46, sleepPerformance: 90, priorNights: PRIOR_NIGHTS });
    const high = calculateRecovery({ ...NIGHT, restingHR: 56, sleepPerformance: 90, priorNights: PRIOR_NIGHTS });
    expect(low.score ?? 0).toBeGreaterThan(high.score ?? 0);
  });

  it('stays within 1–99 at the extremes', () => {
    const best = calculateRecovery({
      restingHR: 20,
      averageSleepingHR: 20,
      sleepPerformance: 100,
      priorNights: PRIOR_NIGHTS,
    });
    const worst = calculateRecovery({
      restingHR: 120,
      averageSleepingHR: 120,
      sleepPerformance: 0,
      priorNights: PRIOR_NIGHTS,
    });
    expect(best.score).toBeLessThanOrEqual(99);
    expect(worst.score).toBeGreaterThanOrEqual(1);
  });

  it('reports a trend against the baseline', () => {
    const result = calculateRecovery({ ...NIGHT, restingHR: 58, sleepPerformance: 90, priorNights: PRIOR_NIGHTS });
    expect(result.restingHRTrend).toBe('up');
  });
});
