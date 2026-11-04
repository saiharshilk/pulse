import { StyleSheet, View } from 'react-native';

import { ErrorState } from '@/components/ErrorState';
import { ScreenBackground } from '@/components/ScreenBackground';
import { SkeletonCard } from '@/components/SkeletonCard';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

// Shown if loading continues after the native splash screen has gone (for example, on retry).
export function InitLoadingView() {
  return (
    <ScreenBackground>
      <View style={styles.content}>
        <SkeletonCard lines={2} height={170} />
        <SkeletonCard />
        <SkeletonCard lines={4} />
      </View>
    </ScreenBackground>
  );
}

type InitErrorViewProps = { message: string; onRetry: () => void };

export function InitErrorView({ message, onRetry }: InitErrorViewProps) {
  return (
    <ScreenBackground>
      <View style={[styles.content, styles.center]}>
        <ErrorState message={message} onRetry={onRetry} />
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: layout.screenPadding, paddingTop: spacing.xxl, gap: spacing.lg },
  center: { justifyContent: 'center' },
});
