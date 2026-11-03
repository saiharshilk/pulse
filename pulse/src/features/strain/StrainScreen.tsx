import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ActivityRow, StrainBadge } from '@/components/ActivityRow';
import { ChartCard } from '@/components/ChartCard';
import { BarChart } from '@/components/charts/BarChart';
import { GaugeBar } from '@/components/charts/GaugeBar';
import { HorizontalBars } from '@/components/charts/HorizontalBars';
import { LineChart } from '@/components/charts/LineChart';
import { DetailScreen } from '@/components/DetailScreen';
import { FadeInSection } from '@/components/FadeInSection';
import { ScoreDial } from '@/components/ScoreDial';
import { StatTile } from '@/components/StatTile';
import { DETAIL } from '@/features/shared/detailConstants';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { STRAIN_INFO } from './strainInfo';
import { STRAIN_MAX } from './strainView';
import { useStrainViewModel } from './useStrainViewModel';

export function StrainScreen() {
  const view = useStrainViewModel();
  const { width } = useWindowDimensions();
  const dialSize = Math.min(width * layout.bigDialWidthRatio, DETAIL.bigDialMaxSize);

  return (
    <DetailScreen title={view.dayLabel} infoTitle="Understand your Strain" info={STRAIN_INFO}>
      <FadeInSection index={0}>
        <View style={styles.dial}>
          <ScoreDial
            value={view.score}
            maxValue={STRAIN_MAX}
            valueText={view.scoreText}
            color={colors.strain}
            label={view.levelLabel}
            size={dialSize}
            large
          />
          {view.isInProgress && <Text style={typography.caption}>IN PROGRESS</Text>}
        </View>
      </FadeInSection>

      <FadeInSection index={1}>
        <ChartCard title="Optimal strain">
          <GaugeBar
            value={view.score}
            max={STRAIN_MAX}
            targetLow={view.target.low}
            targetHigh={view.target.high}
            color={colors.strain}
            minLabel="0"
            maxLabel={String(STRAIN_MAX)}
          />
          <Text style={typography.caption}>{view.targetText}</Text>
          <Text style={typography.body}>{view.insight}</Text>
        </ChartCard>
      </FadeInSection>

      <FadeInSection index={2}>
        <View style={styles.grid}>
          <View style={styles.gridRow}>
            <StatTile value={view.averageHR} caption="AVG HR" />
            <StatTile value={view.maxHR} caption="MAX HR" />
          </View>
          <View style={styles.gridRow}>
            <StatTile value={view.calories} caption="CALORIES" />
            <StatTile value={view.steps} caption="STEPS" />
          </View>
        </View>
      </FadeInSection>

      <FadeInSection index={3}>
        <ChartCard title="Heart rate" emptyText={view.heartRate.length < 2 ? 'No heart-rate readings for this day yet.' : null}>
          <LineChart
            data={view.heartRate}
            color={colors.recoveryRed}
            height={layout.lineChartHeight}
            xDomain={view.heartRateWindow}
            shadedRanges={view.activityRanges}
            startLabel={view.heartRateStartLabel}
            endLabel={view.heartRateEndLabel}
          />
        </ChartCard>
      </FadeInSection>

      <FadeInSection index={4}>
        <ChartCard title="Heart rate zones">
          <HorizontalBars rows={view.zones} />
        </ChartCard>
      </FadeInSection>

      <FadeInSection index={5}>
        <ChartCard title="Activities" emptyText={view.activities.length === 0 ? 'No activities detected.' : null}>
          {view.activities.map((activity) => (
            <ActivityRow
              key={activity.id}
              icon="walk"
              iconColor={colors.strain}
              title={activity.name}
              timeRange={activity.timeRange}
              duration={activity.duration}
              badge={<StrainBadge value={activity.strain} />}
            />
          ))}
        </ChartCard>
      </FadeInSection>

      <FadeInSection index={6}>
        <ChartCard title="Last 7 days">
          <BarChart bars={view.lastDays} maxValue={STRAIN_MAX} height={layout.barChartHeight} />
        </ChartCard>
      </FadeInSection>
    </DetailScreen>
  );
}

const styles = StyleSheet.create({
  dial: { alignItems: 'center', paddingVertical: spacing.sm, gap: spacing.md },
  grid: { gap: spacing.sm },
  gridRow: { flexDirection: 'row', gap: spacing.sm },
});
