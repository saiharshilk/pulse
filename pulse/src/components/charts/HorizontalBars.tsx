import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { useChartReveal } from './useChartReveal';

export type HorizontalBarDatum = {
  key: string;
  label: string;
  caption?: string;
  value: number;
  valueLabel: string;
  color: string;
};

type HorizontalBarsProps = { rows: HorizontalBarDatum[]; maxValue?: number };

function Fill({ fraction, color, reveal }: { fraction: number; color: string; reveal: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({ width: `${fraction * 100 * reveal.get()}%` }));
  return <Animated.View style={[styles.fill, { backgroundColor: color }, style]} />;
}

export function HorizontalBars({ rows, maxValue }: HorizontalBarsProps) {
  const reveal = useChartReveal(rows.map((row) => row.value).join(','));
  const max = maxValue ?? Math.max(...rows.map((row) => row.value), 1e-6);

  return (
    <View style={styles.root}>
      {rows.map((row) => (
        <View key={row.key} style={styles.row}>
          <View style={styles.header}>
            <View style={styles.labels}>
              <Text style={typography.labelCaps} numberOfLines={1}>
                {row.label}
              </Text>
              {row.caption !== undefined && <Text style={typography.caption}>{row.caption}</Text>}
            </View>
            <Text style={typography.metricValue}>{row.valueLabel}</Text>
          </View>
          <View style={styles.track}>
            <Fill fraction={Math.min(1, Math.max(0, row.value / max))} color={row.color} reveal={reveal} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.lg },
  row: { gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.sm },
  labels: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, flexShrink: 1 },
  track: {
    height: layout.horizontalBarHeight,
    borderRadius: layout.horizontalBarHeight / 2,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: layout.horizontalBarHeight / 2 },
});
