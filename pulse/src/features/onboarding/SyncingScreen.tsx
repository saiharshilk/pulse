import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { ErrorState } from '@/components/ErrorState';
import { Logo } from '@/components/Logo';
import { PillButton } from '@/components/PillButton';
import { useAppStore } from '@/store/appStore';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { OnboardingFrame } from './OnboardingFrame';

const BAR_HEIGHT = 4;
const SWEEP_MS = 1100;

// Runs the first sync. When it finishes, onboarding is marked complete and the root layout
// switches to Home on its own.
export function SyncingScreen() {
  const sync = useAppStore((state) => state.sync);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const [error, setError] = useState<string | null>(null);
  const sweep = useSharedValue(0);
  const isMounted = useRef(true);

  const run = useCallback(() => {
    setError(null);
    sync()
      .then(completeOnboarding)
      .catch((syncError: unknown) => {
        if (isMounted.current) setError(syncError instanceof Error ? syncError.message : 'The first sync failed.');
      });
  }, [sync, completeOnboarding]);

  useEffect(() => {
    isMounted.current = true;
    sweep.set(withRepeat(withTiming(1, { duration: SWEEP_MS, easing: Easing.inOut(Easing.ease) }), -1, true));
    run();
    return () => {
      isMounted.current = false;
    };
  }, [run, sweep]);

  const sweepStyle = useAnimatedStyle(() => ({ left: `${sweep.get() * 60}%` }));

  if (error !== null) {
    return (
      // TODO(spec): the prompt doesn't cover a failed first sync; this offers RETRY or continuing without data.
      <OnboardingFrame footer={<PillButton title="Continue without data" onPress={completeOnboarding} />}>
        <ErrorState message={error} onRetry={run} />
      </OnboardingFrame>
    );
  }

  return (
    <OnboardingFrame>
      <View style={styles.center}>
        <Logo size={layout.logoSize * 0.7} />
        <Text style={typography.metricValue}>Syncing your history…</Text>
        <Text style={[typography.caption, styles.caption]}>
          Reading your heart rate and steps, then working out your sleep, recovery and strain.
        </Text>
        <View style={styles.track}>
          <Animated.View style={[styles.sweep, sweepStyle]} />
        </View>
      </View>
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  caption: { textAlign: 'center' },
  track: { alignSelf: 'stretch', height: BAR_HEIGHT, borderRadius: BAR_HEIGHT / 2, backgroundColor: colors.track, overflow: 'hidden' },
  sweep: { position: 'absolute', top: 0, bottom: 0, width: '40%', borderRadius: BAR_HEIGHT / 2, backgroundColor: colors.good },
});
