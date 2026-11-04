import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenBackground } from '@/components/ScreenBackground';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

type OnboardingFrameProps = { children: ReactNode; footer?: ReactNode };

// The shared layout for onboarding steps: scrolling content with buttons pinned at the bottom.
export function OnboardingFrame({ children, footer }: OnboardingFrameProps) {
  const insets = useSafeAreaInsets();
  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
      {footer !== undefined && <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>{footer}</View>}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: layout.screenPadding, paddingTop: spacing.xxxl, gap: spacing.xl },
  footer: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.md, gap: spacing.md },
});
