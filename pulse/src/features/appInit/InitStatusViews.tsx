import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PillButton } from '@/components/PillButton';
import { ScreenBackground } from '@/components/ScreenBackground';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

// Shown if loading continues after the native splash screen has gone (for example, on retry).
export function InitLoadingView() {
  return (
    <ScreenBackground>
      <View style={styles.center}>
        <ActivityIndicator color={colors.textPrimary} />
      </View>
    </ScreenBackground>
  );
}

type InitErrorViewProps = { message: string; onRetry: () => void };

export function InitErrorView({ message, onRetry }: InitErrorViewProps) {
  return (
    <ScreenBackground>
      <View style={styles.center}>
        <Text style={typography.body}>Something went wrong</Text>
        <Text style={[typography.caption, styles.message]}>{message}</Text>
        <PillButton title="Retry" onPress={onRetry} />
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: layout.screenPadding,
  },
  message: { textAlign: 'center' },
});
