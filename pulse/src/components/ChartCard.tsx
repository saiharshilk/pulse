import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { Card } from './Card';
import { SectionHeader } from './SectionHeader';

type ChartCardProps = {
  title: string;
  emptyText?: string | null; // shown instead of the content when there's no data
  summary?: string; // one sentence for VoiceOver, describing what the chart shows
  children?: ReactNode;
};

// A titled card for one detail-screen section, with a one-line empty state.
export function ChartCard({ title, emptyText = null, summary, children }: ChartCardProps) {
  return (
    <Card style={styles.card}>
      {/* VoiceOver reads the title and the one-sentence summary instead of every chart label. */}
      <View
        accessible={summary !== undefined || emptyText !== null}
        accessibilityLabel={`${title}. ${emptyText ?? summary ?? ''}`}
        style={styles.body}>
        <SectionHeader title={title} />
        {emptyText !== null ? <Text style={typography.caption}>{emptyText}</Text> : children}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.lg },
  body: { gap: spacing.lg },
});
