import { useRef } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { BandLegend } from '@/components/BandLegend';
import { Card } from '@/components/Card';
import { DetailScreen, type DetailScrollRef } from '@/components/DetailScreen';
import { FadeInSection } from '@/components/FadeInSection';
import { InsightCard } from '@/components/InsightCard';
import { MetricRow } from '@/components/MetricRow';
import { ScoreDial } from '@/components/ScoreDial';
import { APP_NAME } from '@/config/appConfig';
import { sleepDialLabel } from '@/features/shared/accessibilityLabels';
import { DETAIL } from '@/features/shared/detailConstants';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { SLEEP_INFO } from './sleepInfo';
import { SleepDetailSections } from './SleepDetailSections';
import { useSleepViewModel } from './useSleepViewModel';

const BAND_LEGEND = [
  { label: 'Poor', color: colors.bandPoor },
  { label: 'Sufficient', color: colors.bandSufficient },
  { label: 'Optimal', color: colors.bandOptimal },
];

export function SleepScreen() {
  const view = useSleepViewModel();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<DetailScrollRef>(null);
  const diveTargetY = useRef(0);
  const dialSize = Math.min(width * layout.bigDialWidthRatio, DETAIL.bigDialMaxSize);

  return (
    <DetailScreen title={view.dayLabel} infoTitle="Understand your Sleep" info={SLEEP_INFO} scrollRef={scrollRef}>
      <FadeInSection index={0}>
        <View style={styles.dial}>
          <ScoreDial
            value={view.dialValue}
            maxValue={100}
            suffix="%"
            color={colors.sleep}
            label="SLEEP PERFORMANCE · EST."
            size={dialSize}
            placeholder={!view.hasSleep}
            topLabel={APP_NAME}
            accessibilityLabel={sleepDialLabel(view.hasSleep ? view.dialValue : null)}
            large
          />
        </View>
      </FadeInSection>

      {!view.hasSleep && (
        <FadeInSection index={1}>
          <Card>
            <Text style={typography.body}>No sleep detected for this night. Wear your ring to bed to see your sleep.</Text>
          </Card>
        </FadeInSection>
      )}

      {view.hasSleep && (
        <>
          <FadeInSection index={1}>
            <Card style={styles.metrics}>
              <MetricRow icon="time-outline" title="Hours vs. needed" value={view.performanceText} rangeValue={view.performance} />
              <MetricRow
                icon="calendar-outline"
                title="Sleep consistency"
                value={view.consistencyText}
                caption={view.consistencyCaption}
                rangeValue={view.consistency ?? undefined}
              />
              <MetricRow icon="bed-outline" title="Sleep efficiency" value={view.efficiencyText} rangeValue={view.efficiency} />
              <BandLegend items={BAND_LEGEND} />
            </Card>
          </FadeInSection>

          {view.insight !== null && (
            <FadeInSection index={2}>
              <InsightCard
                text={view.insight}
                linkText="DIVE INTO MY SLEEP →"
                onLinkPress={() => scrollRef.current?.scrollTo({ y: diveTargetY.current, animated: true })}
              />
            </FadeInSection>
          )}
        </>
      )}

      <SleepDetailSections
        view={view}
        onDiveTargetLayout={(y) => {
          diveTargetY.current = y;
        }}
      />

      <Text style={typography.caption}>
        Sleep is estimated from heart rate and movement. Sleep stages aren't available from this ring.
      </Text>
    </DetailScreen>
  );
}

const styles = StyleSheet.create({
  dial: { alignItems: 'center', paddingVertical: spacing.sm },
  metrics: { gap: spacing.xl },
});
