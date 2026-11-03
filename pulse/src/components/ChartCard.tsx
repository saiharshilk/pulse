import type { ReactNode } from 'react';
import { StyleSheet, Text } from 'react-native';

import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { Card } from './Card';
import { SectionHeader } from './SectionHeader';

type ChartCardProps = {
  title: string;
  emptyText?: string | null; // shown instead of the content when there's no data
  children?: ReactNode;
};

// A titled card for one detail-screen section, with a one-line empty state.
export function ChartCard({ title, emptyText = null, children }: ChartCardProps) {
  return (
    <Card style={styles.card}>
      <SectionHeader title={title} />
      {emptyText !== null ? <Text style={typography.caption}>{emptyText}</Text> : children}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.lg },
});
