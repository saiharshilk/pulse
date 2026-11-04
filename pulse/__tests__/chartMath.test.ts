import { boxesOverlap, niceDomain, niceStep, paddedDomain, scaleLinear, splitAtGaps, toPolylinePoints } from '@/components/charts/chartMath';

describe('chart math', () => {
  it('scales a value to pixels', () => {
    expect(scaleLinear(50, [0, 100], [0, 200])).toBe(100);
    expect(scaleLinear(60, [40, 80], [140, 0])).toBe(70); // y grows downward
    expect(scaleLinear(5, [5, 5], [0, 100])).toBe(50); // flat domain → middle
  });

  it('picks nice steps', () => {
    expect(niceStep(3.2)).toBe(5);
    expect(niceStep(0.7)).toBe(1);
    expect(niceStep(17)).toBe(20);
    expect(niceStep(0)).toBe(1);
  });

  it('rounds an axis outward to nice numbers', () => {
    expect(niceDomain(47, 63)).toEqual({ min: 45, max: 65, step: 5 });
    expect(niceDomain(0, 21, 3)).toEqual({ min: 0, max: 30, step: 10 });
    expect(niceDomain(50, 50)).toEqual({ min: 49, max: 51, step: 0.5 });
  });

  it('breaks lines at gaps', () => {
    const points = [0, 5, 10, 60, 65].map((x) => ({ x, y: 1 }));
    expect(splitAtGaps(points, 20).map((segment) => segment.length)).toEqual([3, 2]);
    expect(splitAtGaps([], 20)).toEqual([]);
  });

  it('builds polyline points', () => {
    expect(toPolylinePoints([{ x: 1, y: 2 }, { x: 3, y: 4 }], (x) => x * 10, (y) => y)).toBe('10,2 30,4');
  });
});

describe('paddedDomain', () => {
  it('always contains the data with room to spare', () => {
    // 45 used to sit exactly on the bottom axis, so a 2-pixel line crossed it.
    const domain = paddedDomain(45, 60);
    expect(domain.min).toBeLessThan(45);
    expect(domain.max).toBeGreaterThan(60);
  });

  it('widens a nearly flat series to the minimum span, centered', () => {
    const domain = paddedDomain(71, 73, { minSpan: 20 });
    expect(domain.max - domain.min).toBeGreaterThanOrEqual(20);
    expect(domain.min).toBeLessThanOrEqual(62);
    expect(domain.max).toBeGreaterThanOrEqual(82);
  });

  it('keeps the data inside for many ranges', () => {
    for (const [min, max] of [[0, 1], [44.2, 57.9], [130, 175], [95, 99], [2000, 18000]]) {
      const domain = paddedDomain(min, max);
      expect(domain.min).toBeLessThan(min);
      expect(domain.max).toBeGreaterThan(max);
    }
  });
});

describe('boxesOverlap', () => {
  it('detects overlapping and separate boxes', () => {
    const label = { x: 0, y: 10, width: 60, height: 14 };
    expect(boxesOverlap(label, { x: 40, y: 20, width: 30, height: 14 })).toBe(true);
    expect(boxesOverlap(label, { x: 70, y: 10, width: 30, height: 14 })).toBe(false);
    expect(boxesOverlap(label, { x: 10, y: 30, width: 30, height: 14 })).toBe(false);
  });
});
