import { cleanSyncBatch, dropMissingHeartRates } from '@/data/syncFilters';

describe('sync filters', () => {
  it('drops 0 bpm readings', () => {
    const readings = [
      { ts: 1, bpm: 60 },
      { ts: 2, bpm: 0 },
      { ts: 3, bpm: 62 },
    ];
    expect(dropMissingHeartRates(readings)).toEqual([
      { ts: 1, bpm: 60 },
      { ts: 3, bpm: 62 },
    ]);
  });

  it('removes duplicate timestamps', () => {
    const bucket = { start: 5, steps: 10, calories: 0.4, distanceMeters: 7.5 };
    const cleaned = cleanSyncBatch({
      heartRates: [
        { ts: 1, bpm: 60 },
        { ts: 1, bpm: 60 },
      ],
      steps: [bucket, bucket],
    });
    expect(cleaned.heartRates).toHaveLength(1);
    expect(cleaned.steps).toHaveLength(1);
  });
});
