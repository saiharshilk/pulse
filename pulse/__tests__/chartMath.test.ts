import { niceDomain, niceStep, scaleLinear, splitAtGaps, toPolylinePoints } from '@/components/charts/chartMath';

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
