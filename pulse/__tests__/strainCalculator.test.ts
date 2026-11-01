import { detectActivities } from '@/scoring/activityDetector';
import { calculateStrain } from '@/scoring/strainCalculator';
import { MS_PER_MINUTE } from '@/utils/time';

const START = new Date(2026, 9, 15, 7).getTime();
const END = new Date(2026, 9, 15, 22).getTime();
const RESTING_HR = 50;
const MAX_HR = 187;

// A flat day at `restBpm`, with an optional block of harder effort.
function makeDay(restBpm: number, workout?: { fromMinute: number; minutes: number; bpm: number }) {
  const samples = [];
  for (let ts = START; ts < END; ts += 5 * MS_PER_MINUTE) {
    const minute = (ts - START) / MS_PER_MINUTE;
    const inWorkout =
      workout !== undefined && minute >= workout.fromMinute && minute < workout.fromMinute + workout.minutes;
    samples.push({ ts, bpm: inWorkout ? workout.bpm : restBpm });
  }
  return samples;
}

function strainOf(heartRates: { ts: number; bpm: number }[]) {
  return calculateStrain({
    heartRates,
    window: { start: START, end: END },
    restingHR: RESTING_HR,
    maxHR: MAX_HR,
    calories: 0,
  });
}

describe('calculateStrain', () => {
  it('is 0 for an all-resting day', () => {
    expect(strainOf(makeDay(68)).score).toBe(0);
  });

  it('is higher for a workout day', () => {
    const workoutDay = strainOf(makeDay(68, { fromMinute: 300, minutes: 60, bpm: 155 }));
    expect(workoutDay.score).toBeGreaterThan(strainOf(makeDay(68)).score);
  });

  it('never goes above 21', () => {
    expect(strainOf(makeDay(186)).score).toBeLessThanOrEqual(21);
  });

  it('counts long gaps as zero load', () => {
    // Two hard readings 60 minutes apart are not joined up into an hour of effort.
    const score = strainOf([
      { ts: START, bpm: 180 },
      { ts: START + 60 * MS_PER_MINUTE, bpm: 180 },
    ]).score;
    expect(score).toBeLessThan(1);
  });
});

describe('detectActivities', () => {
  it('finds a sustained workout and ignores a resting day', () => {
    const window = { start: START, end: END };
    const shared = { window, restingHR: RESTING_HR, maxHR: MAX_HR };
    expect(detectActivities({ heartRates: makeDay(68), ...shared })).toEqual([]);

    const activities = detectActivities({
      heartRates: makeDay(68, { fromMinute: 300, minutes: 60, bpm: 155 }),
      ...shared,
    });
    expect(activities).toHaveLength(1);
    expect(activities[0].strainAdded).toBeGreaterThan(0);
    expect(activities[0].id).toBe(`act-${activities[0].start}`);
  });
});
