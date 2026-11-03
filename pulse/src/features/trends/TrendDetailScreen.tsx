import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { DetailScreen } from '@/components/DetailScreen';
import { PressableOpacity } from '@/components/PressableOpacity';
import { SegmentedControl } from '@/components/SegmentedControl';
import { StatTile } from '@/components/StatTile';
import { TrendArrow } from '@/components/TrendArrow';
import { useAppStore } from '@/store/appStore';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { RANGE_OPTIONS } from './HealthScreen';
import { TrendChart } from './TrendChart';
import { TREND_RANGES, type TrendRange } from './trendMath';
import { isTrendMetricKey, type TrendMetricKey } from './trendMetrics';
import { TREND_EMPTY_TEXT } from './trendView';
import { useTrendDetailViewModel } from './useTrendDetailViewModel';

function parseRange(value: string | undefined): TrendRange {
  return TREND_RANGES.find((range) => String(range) === value) ?? 30;
}

function TrendDetail({ metric, initialRange }: { metric: TrendMetricKey; initialRange: TrendRange }) {
  const router = useRouter();
  const selectDay = useAppStore((state) => state.selectDay);
  const [range, setRange] = useState<TrendRange>(initialRange);
  const view = useTrendDetailViewModel(metric, range);

  return (
    <DetailScreen title={view.title}>
      <SegmentedControl options={RANGE_OPTIONS} value={`${range}`} onChange={(key) => setRange(Number(key) as TrendRange)} />
      <Card style={styles.chartCard}>
        <View style={styles.average}>
          <Text style={styles.averageValue}>{view.card.averageText}</Text>
          <TrendArrow trend={view.card.trend} higherIsBetter={view.card.higherIsBetter} />
        </View>
        <Text style={typography.caption}>{view.card.caption}</Text>
        {view.card.chart === null ? (
          <Text style={typography.caption}>{TREND_EMPTY_TEXT}</Text>
        ) : (
          <TrendChart metric={metric} chart={view.card.chart} height={layout.trendDetailChartHeight} />
        )}
      </Card>

      <View style={styles.stats}>
        {view.stats.map((stat) => (
          <View key={stat.label} style={styles.stat}>
            <StatTile value={stat.value} caption={stat.caption === undefined ? stat.label.toUpperCase() : `${stat.label.toUpperCase()} · ${stat.caption}`} />
          </View>
        ))}
      </View>

      <Card style={styles.list}>
        {view.rows.length === 0 && <Text style={typography.caption}>{TREND_EMPTY_TEXT}</Text>}
        {view.rows.map((row) => (
          <PressableOpacity
            key={row.dayKey}
            style={styles.row}
            onPress={() => {
              // Show that day on Home.
              selectDay(row.dayKey);
              router.dismissTo('/');
            }}>
            <Text style={typography.labelCaps}>{row.dayLabel}</Text>
            <Text style={typography.metricValue}>{row.value}</Text>
          </PressableOpacity>
        ))}
      </Card>
    </DetailScreen>
  );
}

export function TrendDetailScreen() {
  const params = useLocalSearchParams<{ metric?: string; range?: string }>();
  if (!isTrendMetricKey(params.metric)) {
    return (
      <DetailScreen title="TREND">
        <Text style={typography.body}>This trend doesn&apos;t exist.</Text>
      </DetailScreen>
    );
  }
  return <TrendDetail metric={params.metric} initialRange={parseRange(params.range)} />;
}

const styles = StyleSheet.create({
  chartCard: { gap: spacing.sm },
  average: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  averageValue: { ...typography.metricValue, fontSize: 32, fontWeight: '700' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stat: { width: '48%', flexGrow: 1, flexDirection: 'row' },
  list: { gap: 0, paddingVertical: spacing.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomColor: colors.cardStroke,
    borderBottomWidth: 1,
  },
});
