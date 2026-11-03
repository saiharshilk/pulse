import { calculateHealthMonitor, healthMonitorRanges, isWithinRange, normalRange } from '@/scoring/healthMonitor';

// Resting 48–52 (mean 50, SD ≈ 1.41), sleeping 5 bpm higher.
const PRIOR = [48, 49, 50, 51, 52].map((restingHR) => ({ restingHR, averageSleepingHR: restingHR + 5 }));

describe('health monitor ranges', () => {
  it('is the mean ± 1.5 SD', () => {
    expect(normalRange(50, 2)).toEqual({ low: 47, high: 53 });
  });

  it('includes both edges of the range', () => {
    const range = { low: 47, high: 53 };
    expect(isWithinRange(47, range)).toBe(true);
    expect(isWithinRange(53, range)).toBe(true);
    expect(isWithinRange(46.9, range)).toBe(false);
    expect(isWithinRange(53.1, range)).toBe(false);
  });

  it('builds ranges for both heart rates once there are 4 nights', () => {
    const ranges = healthMonitorRanges(PRIOR);
    expect(ranges?.restingHR.low).toBeCloseTo(50 - 1.5 * Math.SQRT2);
    expect(ranges?.sleepingHR.high).toBeCloseTo(55 + 1.5 * Math.SQRT2);
    expect(healthMonitorRanges(PRIOR.slice(0, 3))).toBeNull();
  });

  it('uses the SD floor of 1 when nights barely vary', () => {
    const steady = Array.from({ length: 5 }, () => ({ restingHR: 50, averageSleepingHR: 55 }));
    expect(healthMonitorRanges(steady)?.restingHR).toEqual({ low: 48.5, high: 51.5 });
  });
});

describe('calculateHealthMonitor', () => {
  it('is calibrating with fewer than 4 nights or no night', () => {
    expect(calculateHealthMonitor({ lastNight: { restingHR: 50, averageSleepingHR: 55 }, priorNights: PRIOR.slice(0, 3), lastSpO2: null }).state).toEqual({ kind: 'calibrating' });
    expect(calculateHealthMonitor({ lastNight: null, priorNights: PRIOR, lastSpO2: null }).state).toEqual({ kind: 'calibrating' });
  });

  it('is within range when both heart rates are normal', () => {
    const status = calculateHealthMonitor({ lastNight: { restingHR: 50, averageSleepingHR: 55 }, priorNights: PRIOR, lastSpO2: null });
    expect(status.state).toEqual({ kind: 'withinRange' });
  });

  it('counts each heart rate outside its range', () => {
    const one = calculateHealthMonitor({ lastNight: { restingHR: 58, averageSleepingHR: 55 }, priorNights: PRIOR, lastSpO2: null });
    expect(one.state).toEqual({ kind: 'outOfRange', count: 1 });
    const two = calculateHealthMonitor({ lastNight: { restingHR: 58, averageSleepingHR: 64 }, priorNights: PRIOR, lastSpO2: null });
    expect(two.state).toEqual({ kind: 'outOfRange', count: 2 });
  });

  it('never counts SpO2 toward the status', () => {
    const lowSpO2 = { ts: 1, percent: 85 };
    const status = calculateHealthMonitor({ lastNight: { restingHR: 50, averageSleepingHR: 55 }, priorNights: PRIOR, lastSpO2: lowSpO2 });
    expect(status.state).toEqual({ kind: 'withinRange' });
    expect(status.lastSpO2).toBe(lowSpO2);
  });
});
