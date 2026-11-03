import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { Logo } from '@/components/Logo';
import { APP_NAME } from '@/config/appConfig';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const HOLD_MS = 250; // a beat with the logo fully visible before fading into the app

type SplashIntroProps = { onDone: () => void };

// Plays after the native splash hides: the logo fades and scales in, then the whole overlay
// fades away to reveal the app already drawn underneath.
export function SplashIntro({ onDone }: SplashIntroProps) {
  const logoIn = useSharedValue(0);
  const overlay = useSharedValue(1);

  useEffect(() => {
    logoIn.set(withTiming(1, { duration: layout.splashIntroMs, easing: Easing.out(Easing.cubic) }));
    overlay.set(
      withDelay(
        layout.splashIntroMs + HOLD_MS,
        withTiming(0, { duration: layout.splashFadeOutMs }, (finished) => {
          if (finished === true) runOnJS(onDone)();
        }),
      ),
    );
  }, [logoIn, overlay, onDone]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlay.get() }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoIn.get(),
    transform: [{ scale: 0.85 + 0.15 * logoIn.get() }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, overlayStyle]} pointerEvents="none">
      <Animated.View style={[styles.center, logoStyle]}>
        <Logo size={layout.logoSize} />
        <Text style={typography.wordmark}>{APP_NAME}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { backgroundColor: colors.bgBottom, alignItems: 'center', justifyContent: 'center', zIndex: 900 },
  center: { alignItems: 'center', gap: spacing.xl },
});
