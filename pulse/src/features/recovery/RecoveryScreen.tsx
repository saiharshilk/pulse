import { useRef } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { BandLegend } from '@/components/BandLegend';
import { Card } from '@/components/Card';
import { ChartCard } from '@/components/ChartCard';
import { BarChart } from '@/components/charts/BarChart';
import { LineChart } from '@/components/charts/LineChart';
import { DetailScreen, type DetailScrollRef } from '@/components/DetailScreen';
import { FadeInSection } from '@/components/FadeInSection';
import { InsightCard } from '@/components/InsightCard';
import { MetricRow } from '@/components/MetricRow';
import { ScoreDial } from '@/components/ScoreDial';
import { DETAIL } from '@/features/shared/detailConstants';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { RECOVERY_INFO } from './recoveryInfo';
import { useRecoveryViewModel } from './useRecoveryViewModel';

const TREND_LEGEND = [
  { label: 'Better than usual', color: colors.good },
  { label: 'Worse than usual', color: colors.warn },
];

function CalibrationDots({ filled }: { filled: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: DETAIL.calibrationNights }, (_, i) => (
        <View key={i} style={[styles.dot, { backgroundColor: i < filled ? colors.textPrimary : colors.track }]} />
      ))}
    </View>
  );
}

export function RecoveryScreen() {
  const view = useRecoveryViewModel();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<DetailScrollRef>(null);
  const breakdownY = useRef(0);
  const dialSize = Math.min(width * layout.bigDialWidthRatio, DETAIL.bigDialMaxSize);
  const hasMetrics = view.state !== 'noSleep';

  return (
    <DetailScreen title={view.dayLabel} infoTitle="Understand your Recovery" info={RECOVERY_INFO} scrollRef={scrollRef}>
      <FadeInSection index={0}>
        <View style={styles.dial}>
          <ScoreDial
            value={view.dialValue}
            maxValue={100}
            suffix="%"
            color={view.dialColor}
            label={view.dialLabel}
            size={dialSize}
            placeholder={view.state !== 'scored'}
            large
          />
          {view.state === 'calibrating' && (
            <View style={styles.calibration}>
              <Text style={typography.caption}>{view.calibrationText}</Text>
              <CalibrationDots filled={view.nightsCollected} />
            </View>
          )}
        </View>
      </FadeInSection>

      {view.state === 'noSleep' && (
        <FadeInSection index={1}>
          <Card>
            <Text style={typography.body}>No sleep was detected for this night, so recovery can't be calculated.</Text>
          </Card>
        </FadeInSection>
      )}

      {hasMetrics && (
        <FadeInSection index={1}>
          <Card style={styles.metrics}>
            <MetricRow icon="heart-outline" title="Resting heart rate" value={view.restingHR} trend={view.restingHRTrend} higherIsBetter={false} />
            <MetricRow icon="moon-outline" title="Sleeping heart rate" value={view.sleepingHR} trend={view.sleepingHRTrend} higherIsBetter={false} />
            <MetricRow icon="bed-outline" title="Sleep performance" value={view.sleepPerformance} trend={view.sleepPerformanceTrend} />
            <View style={styles.legend}>
              <Text style={typography.caption}>TODAY VS. PRIOR 30 DAYS</Text>
              <BandLegend items={TREND_LEGEND} />
            </View>
          </Card>
        </FadeInSection>
      )}

      {view.insight !== null && (
        <FadeInSection index={2}>
          <InsightCard
            text={view.insight}
            linkText="BREAK DOWN MY RECOVERY →"
            onLinkPress={() => scrollRef.current?.scrollTo({ y: breakdownY.current, animated: true })}
          />
        </FadeInSection>
      )}

      <FadeInSection index={3}>
        <ChartCard title="Last 7 days">
          <BarChart bars={view.lastDays} maxValue={100} height={layout.barChartHeight} />
        </ChartCard>
      </FadeInSection>

      <FadeInSection index={4}>
        <ChartCard title="Resting heart rate · 30 days" emptyText={view.restingLine === null ? 'Not enough nights yet.' : null}>
          {view.restingLine !== null && (
            <LineChart {...view.restingLine} color={colors.recoveryRed} height={layout.lineChartHeight} maxGapMs={Infinity} />
          )}
        </ChartCard>
      </FadeInSection>

      <FadeInSection index={5} onLayout={(event) => (breakdownY.current = event.nativeEvent.layout.y)}>
        <ChartCard title="What drives your recovery">
          <Text style={[typography.body, styles.explain]}>
            Recovery compares your overnight heart rate with your own 30-day baseline: a lower resting and sleeping heart
            rate than usual counts in your favor. Sleep performance makes up the rest. HRV isn&apos;t available from this
            ring, so PULSE uses heart rate alone.
          </Text>
        </ChartCard>
      </FadeInSection>
    </DetailScreen>
  );
}

const styles = StyleSheet.create({
  dial: { alignItems: 'center', paddingVertical: spacing.sm, gap: spacing.md },
  calibration: { alignItems: 'center', gap: spacing.sm },
  dots: { flexDirection: 'row', gap: spacing.sm },
  dot: { width: layout.progressDotSize, height: layout.progressDotSize, borderRadius: layout.progressDotSize / 2 },
  metrics: { gap: spacing.xl },
  legend: { gap: spacing.sm },
  explain: { color: colors.textSecondary, fontSize: 15, lineHeight: 21 },
});
