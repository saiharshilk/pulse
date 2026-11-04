import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

type SkeletonCardProps = { lines?: number; height?: number };

// A placeholder card that gently shimmers while its content loads.
export function SkeletonCard({ lines = 3, height }: SkeletonCardProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.set(withRepeat(withTiming(1, { duration: layout.skeletonPulseMs, easing: Easing.inOut(Easing.ease) }), -1, true));
  }, [shimmer]);

  const style = useAnimatedStyle(() => ({ opacity: 0.4 + 0.4 * shimmer.get() }));

  return (
    <View style={[styles.card, height === undefined ? null : { height }]} accessibilityLabel="Loading">
      <Animated.View style={[styles.title, style]} />
      {Array.from({ length: lines }, (_, i) => (
        <Animated.View key={i} style={[styles.line, { width: `${90 - i * 15}%` }, style]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.cardStroke,
    borderWidth: 1,
    borderRadius: layout.cardRadius,
    padding: layout.cardPadding,
    gap: spacing.md,
  },
  title: { width: '40%', height: 12, borderRadius: 6, backgroundColor: colors.track },
  line: { height: 10, borderRadius: 5, backgroundColor: colors.track },
});
