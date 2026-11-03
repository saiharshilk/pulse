// Pure helpers shared by every chart. No React here, so they're easy to test.

export type ChartPoint = { x: number; y: number };

// Maps a value from one range onto another, e.g. bpm → pixels.
// A flat domain (min === max) maps everything to the middle of the range.
export function scaleLinear(
  value: number,
  domain: [number, number],
  range: [number, number],
): number {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  if (d1 === d0) return (r0 + r1) / 2;
  return r0 + ((value - d0) / (d1 - d0)) * (r1 - r0);
}

// The closest "nice" step (1, 2 or 5 times a power of ten) at or above `rawStep`.
export function niceStep(rawStep: number): number {
  if (!(rawStep > 0) || !Number.isFinite(rawStep)) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

// Rounds an axis outward to nice numbers, e.g. 47–63 bpm becomes 45–65.
export function niceDomain(min: number, max: number, tickCount = 4): { min: number; max: number; step: number } {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 0, max: 1, step: 1 };
  let low = Math.min(min, max);
  let high = Math.max(min, max);
  if (low === high) {
    low -= 1;
    high += 1;
  }
  const step = niceStep((high - low) / tickCount);
  return { min: Math.floor(low / step) * step, max: Math.ceil(high / step) * step, step };
}

// Breaks a series wherever two neighbors are more than `maxGap` apart, so a line
// isn't drawn across time when the ring had no readings.
export function splitAtGaps(points: ChartPoint[], maxGap: number): ChartPoint[][] {
  const segments: ChartPoint[][] = [];
  let current: ChartPoint[] = [];
  for (const point of points) {
    const previous = current.at(-1);
    if (previous !== undefined && point.x - previous.x > maxGap) {
      segments.push(current);
      current = [];
    }
    current.push(point);
  }
  if (current.length > 0) segments.push(current);
  return segments;
}

// "x1,y1 x2,y2 …" for an SVG polyline.
export function toPolylinePoints(
  points: ChartPoint[],
  toX: (x: number) => number,
  toY: (y: number) => number,
): string {
  return points.map((point) => `${toX(point.x)},${toY(point.y)}`).join(' ');
}
