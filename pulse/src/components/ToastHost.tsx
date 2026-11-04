import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useToastStore, type ToastKind } from '@/store/toastStore';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const ICONS: Record<ToastKind, { name: 'checkmark-circle' | 'alert-circle' | 'information-circle'; color: string }> = {
  success: { name: 'checkmark-circle', color: colors.good },
  warning: { name: 'alert-circle', color: colors.warn },
  info: { name: 'information-circle', color: colors.link },
};

// Shows the current toast as a small pill just below the status bar and hides it after 2 seconds.
// It hugs the status bar and stays narrow so it doesn't sit on top of screen titles.
// Rendered once, in the root layout, above every screen.
export function ToastHost() {
  const toast = useToastStore((state) => state.toast);
  const hideToast = useToastStore((state) => state.hideToast);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (toast === null) return;
    const timer = setTimeout(() => hideToast(toast.id), layout.toastMs);
    return () => clearTimeout(timer);
  }, [toast, hideToast]);

  if (toast === null) return null;
  const icon = ICONS[toast.kind];
  return (
    <Animated.View
      key={toast.id}
      entering={FadeInUp.duration(200)}
      exiting={FadeOutUp.duration(200)}
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[styles.slot, { top: insets.top + layout.toastTopGap }]}>
      <View style={styles.pill}>
        <Ionicons name={icon.name} size={layout.toastIconSize} color={icon.color} />
        <Text style={[typography.body, styles.text]} numberOfLines={2}>
          {toast.message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  slot: {
    position: 'absolute',
    left: layout.screenPadding,
    right: layout.screenPadding,
    alignItems: 'center',
    zIndex: 1000,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: layout.toastPaddingVertical,
    borderRadius: layout.toastRadius,
    backgroundColor: colors.card,
    borderColor: colors.cardStroke,
    borderWidth: 1,
  },
  text: { flexShrink: 1, fontSize: 14 },
});
