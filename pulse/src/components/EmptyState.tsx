import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { Card } from './Card';
import { PillButton } from './PillButton';

type EmptyStateProps = {
  icon?: ComponentProps<typeof Ionicons>['name'];
  title: string;
  message: string;
  actionTitle?: string;
  onAction?: () => void;
};

// Shown when there's simply nothing to display yet.
export function EmptyState({ icon = 'leaf-outline', title, message, actionTitle, onAction }: EmptyStateProps) {
  return (
    <Card style={styles.card}>
      <Ionicons name={icon} size={36} color={colors.textSecondary} />
      <Text style={[typography.metricValue, styles.center]}>{title}</Text>
      <Text style={[typography.caption, styles.center]}>{message}</Text>
      {actionTitle !== undefined && onAction !== undefined && <PillButton title={actionTitle} onPress={onAction} />}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl },
  center: { textAlign: 'center' },
});
