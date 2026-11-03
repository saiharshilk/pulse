import { generateMockHistory } from '@/data/mock/mockDataGenerator';
import { dropMissingHeartRates } from '@/data/syncFilters';
import { buildRecoveryView } from '@/features/recovery/recoveryView';
import { buildSleepView } from '@/features/sleep/sleepView';
import { buildStrainView, strainLevelLabel } from '@/features/strain/strainView';
import { computeSummaries } from '@/scoring/scoringEngine';
import { DEFAULT_PROFILE } from '@/types/profile';

const NOW = new Date(2026, 9, 15, 18, 0).getTime();
const history = generateMockHistory({ seed: 3, now: NOW, days: 30 });
const heartRates = dropMissingHeartRates(history.heartRates);
const summaries = computeSummaries({ heartRates, steps: history.steps, spo2Checks: [], profile: DEFAULT_PROFILE, now: NOW });

describe('detail screen views', () => {
  it('shows an empty sleep screen when no sleep was detected', () => {
    const view = buildSleepView(null, [], []);
    expect(view.hasSleep).toBe(false);
    expect(view.timeline).toBeNull();
    expect(view.insight).toBeNull();
  });

  it('fills the sleep screen on a normal night', () => {
    const today = summaries.at(-1) ?? null;
    const view = buildSleepView(today, summaries, heartRates);
    expect(view.hasSleep).toBe(true);
    expect(view.hoursAsleep).toMatch(/^\d+:\d\d$/);
    expect(view.lastNights).toHaveLength(7);
    expect(view.timeline?.heartRate.length).toBeGreaterThan(10);
  });

  it('shows calibration progress on the first nights', () => {
    const early = summaries.findIndex((day) => day.recovery?.isCalibrating === true);
    const view = buildRecoveryView(summaries[early], summaries.slice(0, early + 1));
    expect(view.state).toBe('calibrating');
    expect(view.dialLabel).toBe('CALIBRATING');
    expect(view.calibrationText).toMatch(/^\d of 4 nights collected$/);
  });

  it('scores recovery once calibrated', () => {
    const view = buildRecoveryView(summaries.at(-1) ?? null, summaries);
    expect(view.state).toBe('scored');
    expect(view.insight).not.toBeNull();
    expect(view.restingLine?.data.length).toBeGreaterThan(10);
  });

  it('labels strain levels and marks today as in progress', () => {
    expect([strainLevelLabel(4), strainLevelLabel(10), strainLevelLabel(14), strainLevelLabel(18)]).toEqual([
      'LIGHT',
      'MODERATE',
      'STRENUOUS',
      'ALL OUT',
    ]);
    const view = buildStrainView(summaries.at(-1) ?? null, summaries, heartRates, true);
    expect(view.isInProgress).toBe(true);
    expect(view.zones).toHaveLength(5);
    expect(view.zones[0].caption).toBe('50–60%');
    expect(view.lastDays).toHaveLength(7);
  });
});
