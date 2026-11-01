import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { Trend } from '@/types/computed';

import { RangeBar } from './RangeBar';
import { TrendArrow } from './TrendArrow';

type MetricRowProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  value: string;
  trend?: Trend;
  higherIsBetter?: boolean;
  rangeValue?: number;
};

export function MetricRow({ icon, title, value, trend, higherIsBetter = true, rangeValue }: MetricRowProps) {
  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={18} color={colors.textPrimary} />
        </View>
        <Text style={[typography.labelCaps, styles.title]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={typography.metricValue}>{value}</Text>
        {trend !== undefined && <TrendArrow trend={trend} higherIsBetter={higherIsBetter} />}
      </View>
      {rangeValue !== undefined && <RangeBar value={rangeValue} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconCircle: {
    width: layout.iconCircle,
    height: layout.iconCircle,
    borderRadius: layout.iconCircle / 2,
    backgroundColor: colors.iconCircle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1 },
});
