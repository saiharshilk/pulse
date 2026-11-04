import { StyleSheet, Text, View } from 'react-native';

import { LineChart } from '@/components/charts/LineChart';
import { ErrorState } from '@/components/ErrorState';
import { PillButton } from '@/components/PillButton';
import { StatTile } from '@/components/StatTile';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { LIVE } from './liveMath';
import { PulsingHeart } from './PulsingHeart';
import type { useLiveViewModel } from './useLiveViewModel';

type HeartRateModeProps = { view: ReturnType<typeof useLiveViewModel>['heartRate'] };

export function HeartRateMode({ view }: HeartRateModeProps) {
  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <PulsingHeart bpm={view.isRunning ? view.bpm : null} />
        <Text style={typography.bigDialValue}>{view.bpmText}</Text>
        <Text style={typography.labelCaps}>BPM</Text>
        <Text style={typography.caption}>{view.zoneLabel}</Text>
      </View>

      <View style={styles.chart}>
        <LineChart
          data={view.chartData}
          xDomain={view.chartDomain}
          color={colors.recoveryRed}
          height={layout.liveChartHeight}
          startLabel="60 s ago"
          endLabel="now"
          animateReveal={false}
          minYSpan={LIVE.chartMinSpanBpm}
        />
      </View>

      <View style={styles.stats}>
        <StatTile value={view.min} caption="MIN" />
        <StatTile value={view.avg} caption="AVG" />
        <StatTile value={view.max} caption="MAX" />
      </View>

      {view.error !== null ? (
        <ErrorState message={view.error} onRetry={view.start} />
      ) : (
        <PillButton title={view.isRunning ? 'Stop' : 'Start'} onPress={view.isRunning ? view.stop : view.start} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.xl },
  hero: { alignItems: 'center', gap: spacing.xs },
  chart: { minHeight: layout.liveChartHeight },
  stats: { flexDirection: 'row', gap: spacing.sm },
});
