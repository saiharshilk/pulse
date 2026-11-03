import { optimalStrainTarget } from '@/scoring/strainTarget';

describe('optimalStrainTarget', () => {
  it('suits each recovery band', () => {
    expect(optimalStrainTarget(80)).toEqual({ low: 14, high: 18 });
    expect(optimalStrainTarget(67)).toEqual({ low: 14, high: 18 });
    expect(optimalStrainTarget(50)).toEqual({ low: 10, high: 14 });
    expect(optimalStrainTarget(34)).toEqual({ low: 10, high: 14 });
    expect(optimalStrainTarget(20)).toEqual({ low: 0, high: 10 });
  });

  it('uses the moderate range while calibrating', () => {
    expect(optimalStrainTarget(null)).toEqual({ low: 10, high: 14 });
  });
});
