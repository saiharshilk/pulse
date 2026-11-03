import { useEffect } from 'react';
import { Easing, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';

import { layout } from '@/theme/layout';

// Goes from 0 to 1 when a chart first appears, and again whenever `revealKey` changes.
// With `enabled` false it stays at 1, for charts that update every second.
export function useChartReveal(revealKey: unknown, enabled = true): SharedValue<number> {
  const progress = useSharedValue(enabled ? 0 : 1);
  useEffect(() => {
    if (!enabled) {
      progress.set(1);
      return;
    }
    progress.set(0);
    progress.set(withTiming(1, { duration: layout.chartRevealMs, easing: Easing.out(Easing.cubic) }));
  }, [progress, revealKey, enabled]);
  return progress;
}

// SVG ids must be unique on screen and can't contain React's ":" characters.
export function svgId(prefix: string, reactId: string): string {
  return `${prefix}-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;
}
