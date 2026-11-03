import { StyleSheet, Text, View } from 'react-native';

import { ChartCard } from '@/components/ChartCard';
import { BarChart } from '@/components/charts/BarChart';
import { HorizontalBars } from '@/components/charts/HorizontalBars';
import { SleepTimeline } from '@/components/charts/SleepTimeline';
import { FadeInSection } from '@/components/FadeInSection';
import { StatTile } from '@/components/StatTile';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import type { SleepView } from './sleepView';

type SleepDetailSectionsProps = {
  view: SleepView;
  onDiveTargetLayout: (y: number) => void; // where "DIVE INTO MY SLEEP" scrolls to
};

const NO_SLEEP = 'No sleep detected for this night.';

// Sections 4–7: last night's timeline, sleeping heart rate, sleep need and the last 7 nights.
export function SleepDetailSections({ view, onDiveTargetLayout }: SleepDetailSectionsProps) {
  return (
    <>
      <FadeInSection index={3} onLayout={(event) => onDiveTargetLayout(event.nativeEvent.layout.y)}>
        <ChartCard title="Last night's sleep" emptyText={view.timeline === null ? NO_SLEEP : null}>
          {view.timeline !== null && <SleepTimeline {...view.timeline} />}
          <View style={styles.tiles}>
            <StatTile value={view.hoursAsleep} caption="HOURS ASLEEP" />
            <StatTile value={view.timeInBed} caption="TIME IN BED" />
            <StatTile value={view.wakeUps} caption="WAKE-UPS" />
          </View>
        </ChartCard>
      </FadeInSection>

      <FadeInSection index={4}>
        <ChartCard title="Sleeping heart rate" emptyText={view.hasSleep ? null : NO_SLEEP}>
          <View style={styles.tiles}>
            <StatTile value={view.restingHR} caption="RESTING HR" />
            <StatTile value={view.averageSleepingHR} caption="AVG SLEEPING HR" />
          </View>
        </ChartCard>
      </FadeInSection>

      <FadeInSection index={5}>
        <ChartCard title="Sleep need" emptyText={view.hasSleep ? null : NO_SLEEP}>
          <HorizontalBars rows={view.needRows} />
          <View style={styles.total}>
            <Text style={typography.labelCaps}>Total need</Text>
            <Text style={typography.metricValue}>{view.needTotal}</Text>
          </View>
        </ChartCard>
      </FadeInSection>

      <FadeInSection index={6}>
        <ChartCard title="Last 7 nights" emptyText={view.hasLastNights ? null : 'No sleep detected in the last 7 nights.'}>
          <BarChart bars={view.lastNights} target={view.needTarget ?? undefined} height={layout.barChartHeight} />
        </ChartCard>
      </FadeInSection>
    </>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: 'row', gap: spacing.sm },
  total: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
