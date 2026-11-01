// A small seeded random number generator (mulberry32).
// The same seed always produces the same sequence, which keeps mock data repeatable.

export type SeededRandom = {
  next(): number; // 0 (inclusive) to 1 (exclusive)
  range(min: number, max: number): number;
  int(min: number, max: number): number; // both ends inclusive
  chance(probability: number): boolean;
  normal(mean: number, sd: number): number;
};

export function createSeededRandom(seed: number): SeededRandom {
  let state = seed >>> 0;

  function next(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  return {
    next,
    range: (min, max) => min + next() * (max - min),
    int: (min, max) => Math.floor(min + next() * (max - min + 1)),
    chance: (probability) => next() < probability,
    normal: (mean, sd) => {
      // Box-Muller transform. 1 - next() avoids log(0).
      const u = 1 - next();
      const v = next();
      return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    },
  };
}

// Turns a seed plus a label (like a date) into a new seed (FNV-1a hash).
export function deriveSeed(seed: number, label: string): number {
  let hash = (0x811c9dc5 ^ seed) >>> 0;
  for (let i = 0; i < label.length; i++) {
    hash = Math.imul(hash ^ label.charCodeAt(i), 0x01000193) >>> 0;
  }
  return hash;
}
