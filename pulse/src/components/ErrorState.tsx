import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { Card } from './Card';
import { PillButton } from './PillButton';

type ErrorStateProps = { message: string; onRetry: () => void };

// A friendly message and a RETRY button, for anything that failed.
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Card style={styles.card}>
      <Ionicons name="cloud-offline-outline" size={36} color={colors.warn} />
      <Text style={[typography.metricValue, styles.center]}>Something went wrong</Text>
      <Text style={[typography.caption, styles.center]}>{message}</Text>
      <PillButton title="Retry" onPress={onRetry} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl },
  center: { textAlign: 'center' },
});
