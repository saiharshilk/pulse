import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { useEffect, type ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { lightHaptic } from '@/utils/haptics';

import { PressableOpacity } from './PressableOpacity';

type TabDisplay = { label: string; icon: ComponentProps<typeof Ionicons>['name'] };

// Keyed by route file name in app/(tabs)/.
const TAB_DISPLAY: Record<string, TabDisplay> = {
  index: { label: 'Home', icon: 'home-outline' },
  health: { label: 'Health', icon: 'pulse-outline' },
  device: { label: 'Device', icon: 'radio-button-on-outline' },
};

function LiveButton({ onPress }: { onPress: () => void }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.set(
      withRepeat(
        withTiming(1, { duration: layout.liveButtonPulseMs, easing: Easing.inOut(Easing.ease) }),
        -1, // forever
        true, // back and forth
      ),
    );
  }, [pulse]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + (layout.liveButtonPulseScale - 1) * pulse.get() }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + 0.6 * pulse.get(),
    transform: [{ scale: 1 + 0.08 * pulse.get() }],
  }));

  return (
    <PressableOpacity onPress={onPress} style={styles.liveButton} accessibilityLabel="Open live heart rate">
      <Animated.View style={[styles.liveGlow, glowStyle]} />
      <View style={styles.liveFace}>
        <Animated.View style={iconStyle}>
          <Ionicons name="fitness-outline" size={26} color={colors.liveIcon} />
        </Animated.View>
      </View>
    </PressableOpacity>
  );
}

export function FloatingTabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.root, { bottom: insets.bottom + layout.tabBarFloat }]}>
      <View style={styles.capsule}>
        <BlurView tint="dark" intensity={layout.tabBarBlurIntensity} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.overlay]} />
        {state.routes.map((route, index) => {
          const display = TAB_DISPLAY[route.name];
          if (display === undefined) return null;
          const focused = state.index === index;
          const tint = focused ? colors.textPrimary : colors.textSecondary;

          function handlePress() {
            const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              lightHaptic();
              navigateToTab(route.key);
            }
          }

          return (
            <PressableOpacity
              key={route.key}
              onPress={handlePress}
              style={styles.tab}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}>
              <Ionicons name={display.icon} size={22} color={tint} />
              <Text style={[styles.tabLabel, { color: tint }]}>{display.label}</Text>
            </PressableOpacity>
          );
        })}
      </View>
      <LiveButton
        onPress={() => {
          lightHaptic();
          router.push('/live');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: layout.tabBarSideMargin,
    right: layout.tabBarSideMargin,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  capsule: {
    flex: 1,
    flexDirection: 'row',
    height: layout.tabBarHeight,
    borderRadius: layout.tabBarHeight / 2,
    overflow: 'hidden',
    borderColor: colors.cardStroke,
    borderWidth: 1,
  },
  overlay: { backgroundColor: colors.tabBarOverlay },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabLabel: { fontSize: 11, fontWeight: '600' },
  liveButton: {
    width: layout.tabBarHeight,
    height: layout.tabBarHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveGlow: {
    ...StyleSheet.absoluteFill,
    borderRadius: layout.tabBarHeight / 2,
    borderWidth: 2,
    borderColor: colors.liveGlow,
  },
  liveFace: {
    width: layout.tabBarHeight - 8,
    height: layout.tabBarHeight - 8,
    borderRadius: (layout.tabBarHeight - 8) / 2,
    backgroundColor: colors.liveButton,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
