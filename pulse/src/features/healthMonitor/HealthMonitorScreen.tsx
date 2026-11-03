import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { ChartCard } from '@/components/ChartCard';
import { LineChart } from '@/components/charts/LineChart';
import { DetailScreen } from '@/components/DetailScreen';
import { FadeInSection } from '@/components/FadeInSection';
import { PressableOpacity } from '@/components/PressableOpacity';
import { DETAIL } from '@/features/shared/detailConstants';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { HEALTH_MONITOR_INFO } from './healthMonitorInfo';
import { HEALTH_MONITOR_EMPTY_SPO2, type VitalCardView } from './healthMonitorView';
import { useHealthMonitorViewModel } from './useHealthMonitorViewModel';

const HERO_ICON_SIZE = 56;

function VitalCard({ vital }: { vital: VitalCardView }) {
  return (
    <ChartCard title={vital.title}>
      <View style={styles.vitalRow}>
        <Text style={styles.vitalValue}>{vital.value}</Text>
        {vital.inRange !== null && (
          <Ionicons
            name={vital.inRange ? 'checkmark-circle' : 'alert-circle'}
            size={22}
            color={vital.inRange ? colors.good : colors.warn}
          />
        )}
      </View>
      <Text style={typography.caption}>{vital.rangeText ?? 'Normal range appears after calibration'}</Text>
      {vital.chart !== null && (
        <LineChart {...vital.chart} color={colors.recoveryRed} height={layout.lineChartHeight} maxGapMs={Infinity} />
      )}
    </ChartCard>
  );
}

export function HealthMonitorScreen() {
  const view = useHealthMonitorViewModel();
  const router = useRouter();

  return (
    <DetailScreen title="HEALTH MONITOR" subtitle={view.dayLabel} infoTitle="Understand Health Monitor" info={HEALTH_MONITOR_INFO}>
      <FadeInSection index={0}>
        <Card style={styles.hero}>
          <Ionicons name={view.hero.icon} size={HERO_ICON_SIZE} color={view.hero.color} />
          <Text style={[typography.screenTitle, styles.center]}>{view.hero.title}</Text>
          <Text style={[typography.body, styles.explanation]}>{view.hero.explanation}</Text>
          {view.isCalibrating && (
            <View style={styles.calibration}>
              <Text style={typography.caption}>{view.calibrationText}</Text>
              <View style={styles.dots}>
                {Array.from({ length: DETAIL.calibrationNights }, (_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, { backgroundColor: i < view.nightsCollected ? colors.textPrimary : colors.track }]}
                  />
                ))}
              </View>
            </View>
          )}
        </Card>
      </FadeInSection>

      {view.vitals.map((vital, i) => (
        <FadeInSection key={vital.title} index={i + 1}>
          <VitalCard vital={vital} />
        </FadeInSection>
      ))}

      <FadeInSection index={3}>
        <ChartCard title="Blood oxygen (spot check)">
          {view.spo2 === null ? (
            <Text style={typography.caption}>{HEALTH_MONITOR_EMPTY_SPO2}</Text>
          ) : (
            <>
              <View style={styles.vitalRow}>
                <Text style={styles.vitalValue}>{view.spo2.latest}</Text>
                <Text style={typography.caption}>{view.spo2.latestAgo}</Text>
              </View>
              <View style={styles.list}>
                {view.spo2.recent.map((check) => (
                  <View key={check.key} style={styles.listRow}>
                    <Text style={typography.caption}>{check.label}</Text>
                    <Text style={typography.metricValue}>{check.value}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
          <PressableOpacity onPress={() => router.push({ pathname: '/live', params: { mode: 'spo2' } })}>
            <Text style={styles.link}>TAKE A READING →</Text>
          </PressableOpacity>
        </ChartCard>
      </FadeInSection>
    </DetailScreen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl },
  center: { textAlign: 'center' },
  explanation: { textAlign: 'center', color: colors.textSecondary },
  calibration: { alignItems: 'center', gap: spacing.sm },
  dots: { flexDirection: 'row', gap: spacing.sm },
  dot: { width: layout.progressDotSize, height: layout.progressDotSize, borderRadius: layout.progressDotSize / 2 },
  vitalRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  vitalValue: { ...typography.metricValue, fontSize: 28, fontWeight: '700' },
  list: { gap: spacing.sm },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  link: { ...typography.labelCaps, fontSize: 12, color: colors.link },
});
