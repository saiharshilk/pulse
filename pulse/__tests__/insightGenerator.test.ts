import { recoveryInsight, sleepInsight, strainInsight } from '@/insights/insightGenerator';
import type { RecoveryMetrics, SleepEstimate, StrainMetrics } from '@/types/computed';
import { MS_PER_HOUR, MS_PER_MINUTE } from '@/utils/time';

function makeSleep(overrides: Partial<SleepEstimate> = {}): SleepEstimate {
  return {
    bedtime: 0,
    wakeTime: 8 * MS_PER_HOUR,
    timeInBedMs: 8 * MS_PER_HOUR,
    timeAsleepMs: 8 * MS_PER_HOUR,
    awakeIntervals: [],
    sleepNeededMs: 8 * MS_PER_HOUR,
    needBreakdown: { baselineMs: 8 * MS_PER_HOUR, strainMs: 0, debtMs: 0 },
    performance: 90,
    efficiency: 95,
    consistency: 90,
    restingHR: 48,
    averageSleepingHR: 54,
    ...overrides,
  };
}
const FOUR_NIGHTS = [makeSleep(), makeSleep(), makeSleep(), makeSleep()];

function makeRecovery(overrides: Partial<RecoveryMetrics> = {}): RecoveryMetrics {
  return {
    score: 80,
    isCalibrating: false,
    nightsCollected: 10,
    restingHR: 47,
    averageSleepingHR: 53,
    sleepPerformance: 90,
    restingHRTrend: 'down',
    sleepingHRTrend: 'flat',
    baseline: { restingHRMean: 50, restingHRSd: 2, sleepingHRMean: 55, sleepingHRSd: 2 },
    ...overrides,
  };
}

function makeStrain(score: number): StrainMetrics {
  return { score, averageHR: 80, maxHR: 150, zoneMinutes: [0, 0, 0, 0, 0], lightMinutes: 0, calories: 2000, window: { start: 0, end: 1 } };
}

describe('sleepInsight', () => {
  it('says you got the sleep you needed at 85% or more', () => {
    expect(sleepInsight(makeSleep({ performance: 92 }), FOUR_NIGHTS)).toBe('You got the sleep you needed.');
  });

  it('says you got less than you needed below 70%', () => {
    expect(sleepInsight(makeSleep({ performance: 60 }), FOUR_NIGHTS)).toBe('You got less sleep than your body needed.');
  });

  it('has a middle sentence for 70–84%', () => {
    expect(sleepInsight(makeSleep({ performance: 78 }), FOUR_NIGHTS)).toBe('You got most of the sleep you needed.');
  });

  it('mentions an inconsistent bedtime', () => {
    expect(sleepInsight(makeSleep({ consistency: 40 }), FOUR_NIGHTS)).toContain('inconsistent lately');
  });

  it('skips consistency without enough history', () => {
    expect(sleepInsight(makeSleep({ consistency: 40 }), [])).toBe('You got the sleep you needed.');
  });

  it('mentions sleep debt over 30 minutes', () => {
    const sleep = makeSleep({ needBreakdown: { baselineMs: 8 * MS_PER_HOUR, strainMs: 0, debtMs: 45 * MS_PER_MINUTE } });
    expect(sleepInsight(sleep, FOUR_NIGHTS)).toContain('sleep debt');
  });

  it('mentions wake-ups when efficiency is low', () => {
    expect(sleepInsight(makeSleep({ efficiency: 80 }), FOUR_NIGHTS)).toContain('woke up several times');
  });
});

describe('recoveryInsight', () => {
  it('explains calibration', () => {
    expect(recoveryInsight(makeRecovery({ isCalibrating: true, score: null }))).toBe(
      'PULSE is still learning your baseline. Recovery appears after 4 nights.',
    );
  });

  it('describes a well-recovered day', () => {
    expect(recoveryInsight(makeRecovery())).toBe(
      "Your resting heart rate is below your baseline and you slept well, so you're well recovered.",
    );
  });

  it('describes a moderate day', () => {
    expect(recoveryInsight(makeRecovery({ score: 50, restingHRTrend: 'flat', sleepPerformance: 75 }))).toBe(
      "Your resting heart rate is close to your baseline and you slept reasonably, so you're moderately recovered.",
    );
  });

  it('describes a red day and a raised sleeping heart rate', () => {
    expect(
      recoveryInsight(makeRecovery({ score: 20, restingHRTrend: 'up', sleepPerformance: 60, sleepingHRTrend: 'up' })),
    ).toBe(
      'Your resting heart rate is above your baseline and you were short on sleep, so your body could use some rest today. Your heart rate also stayed higher than usual overnight.',
    );
  });

  it('mentions a lower sleeping heart rate', () => {
    expect(recoveryInsight(makeRecovery({ sleepingHRTrend: 'down' }))).toContain('lower than usual overnight');
  });
});

describe('strainInsight', () => {
  const target = { low: 10, high: 14 };

  it('is below the target', () => {
    expect(strainInsight(makeStrain(6.2), target)).toBe("You're below today's optimal strain. You have room to push.");
  });

  it('is in the target', () => {
    expect(strainInsight(makeStrain(12), target)).toBe("You're in your optimal strain range.");
  });

  it('is above the target', () => {
    expect(strainInsight(makeStrain(15.1), target)).toBe(
      "You've gone past today's optimal strain. Prioritize recovery tonight.",
    );
  });
});
