import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import Animated, { useAnimatedStyle, useFrameCallback, useSharedValue } from 'react-native-reanimated';

import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';

type PulsingHeartProps = { bpm: number | null };

const DEFAULT_BEAT_MS = 1000;

// A heart that beats in time with `bpm`. The beat's phase advances every frame, so a new bpm
// changes the speed smoothly instead of restarting the animation.
export function PulsingHeart({ bpm }: PulsingHeartProps) {
  const beatMs = useSharedValue(DEFAULT_BEAT_MS);
  const phase = useSharedValue(0); // 0 → 1 over one beat

  useEffect(() => {
    beatMs.set(bpm === null || bpm <= 0 ? DEFAULT_BEAT_MS : 60_000 / bpm);
  }, [beatMs, bpm]);

  const frame = useFrameCallback((info) => {
    const elapsed = info.timeSincePreviousFrame ?? 16;
    phase.set((phase.get() + elapsed / beatMs.get()) % 1);
  }, false);

  useEffect(() => {
    frame.setActive(bpm !== null);
    if (bpm === null) phase.set(0);
  }, [bpm, frame, phase]);

  const style = useAnimatedStyle(() => {
    // A quick swell over the first 15% of the beat, then a slower settle back.
    const p = phase.get();
    const swell = p < 0.15 ? p / 0.15 : Math.max(0, 1 - (p - 0.15) / 0.35);
    return { transform: [{ scale: 1 + layout.liveHeartPulseScale * swell }] };
  });

  return (
    <Animated.View style={style}>
      <Ionicons name="heart" size={layout.liveHeartSize} color={colors.recoveryRed} />
    </Animated.View>
  );
}
