import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { PressableOpacity } from '@/components/PressableOpacity';
import { TrendArrow } from '@/components/TrendArrow';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { TrendChart } from './TrendChart';
import { TREND_EMPTY_TEXT, type TrendCardView } from './trendView';

const TREND_WORDS = { up: 'up', down: 'down', flat: 'steady' } as const;

type TrendCardProps = { card: TrendCardView; onPress: () => void };

// One metric on the Health tab. Memoized so changing one card doesn't redraw all nine charts.
export const TrendCard = memo(function TrendCard({ card, onPress }: TrendCardProps) {
  return (
    <PressableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${card.title}, average ${card.averageText}, ${card.caption}, trending ${TREND_WORDS[card.trend]}`}
      accessibilityHint="Opens the full trend">
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={[typography.labelCaps, styles.title]}>{card.title}</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
        </View>
        <View style={styles.average}>
          <Text style={styles.averageValue}>{card.averageText}</Text>
          <TrendArrow trend={card.trend} higherIsBetter={card.higherIsBetter} />
        </View>
        <Text style={typography.caption}>{card.caption}</Text>
        {card.chart === null ? (
          <Text style={typography.caption}>{TREND_EMPTY_TEXT}</Text>
        ) : (
          <TrendChart metric={card.key} chart={card.chart} height={layout.trendCardChartHeight} />
        )}
      </Card>
    </PressableOpacity>
  );
});

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  title: { flexShrink: 1 },
  average: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  averageValue: { ...typography.metricValue, fontSize: 28, fontWeight: '700' },
});
