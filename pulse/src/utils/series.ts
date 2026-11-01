// Shrinks a long series to at most `maxPoints` by averaging neighbors, so charts stay light.
export function downsampleAverage(values: number[], maxPoints: number): number[] {
  if (values.length <= maxPoints) return values;
  const result: number[] = [];
  const size = values.length / maxPoints;
  for (let i = 0; i < maxPoints; i++) {
    const group = values.slice(Math.floor(i * size), Math.floor((i + 1) * size));
    result.push(group.reduce((a, b) => a + b, 0) / group.length);
  }
  return result;
}
