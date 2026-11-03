import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { PillButton } from '@/components/PillButton';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { MeasuringRing } from './MeasuringRing';
import type { useLiveViewModel } from './useLiveViewModel';

type SpO2ModeProps = { view: ReturnType<typeof useLiveViewModel>['spo2'] };

export function SpO2Mode({ view }: SpO2ModeProps) {
  const { phase } = view;
  return (
    <View style={styles.root}>
      <Text style={[typography.body, styles.instruction]}>Keep your hand still and rest it on a flat surface.</Text>

      <MeasuringRing
        progress={phase.kind === 'measuring' ? view.progress : phase.kind === 'result' ? 1 : 0}
        spinning={phase.kind === 'measuring'}
        color={phase.kind === 'failed' ? colors.warn : colors.link}>
        {phase.kind === 'idle' && <Ionicons name="water-outline" size={56} color={colors.textSecondary} />}
        {phase.kind === 'measuring' && (
          <View style={styles.center}>
            <Text style={typography.labelCaps}>MEASURING…</Text>
            <Text style={typography.caption}>{view.countdownText}</Text>
          </View>
        )}
        {phase.kind === 'result' && (
          <View style={styles.center}>
            <Text style={typography.bigDialValue}>{view.resultText}</Text>
            <Text style={typography.labelCaps}>BLOOD OXYGEN</Text>
          </View>
        )}
        {phase.kind === 'failed' && <Ionicons name="alert-circle-outline" size={56} color={colors.warn} />}
      </MeasuringRing>

      {phase.kind === 'result' && <Text style={[typography.caption, styles.status]}>{view.saveText}</Text>}
      {phase.kind === 'failed' && (
        <Text style={[typography.body, styles.status]}>
          Couldn&apos;t get a reading. Make sure the ring is snug and try again.
        </Text>
      )}

      {phase.kind !== 'measuring' && (
        <PillButton
          title={phase.kind === 'idle' ? 'Start measurement' : phase.kind === 'result' ? 'Measure again' : 'Try again'}
          onPress={view.start}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', gap: spacing.xxl },
  instruction: { textAlign: 'center', color: colors.textSecondary },
  center: { alignItems: 'center', gap: spacing.xs },
  status: { textAlign: 'center' },
});
