// Heart rate logging, units and data source.
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { PressableOpacity } from '@/components/PressableOpacity';
import { SectionHeader } from '@/components/SectionHeader';
import { SegmentedControl } from '@/components/SegmentedControl';
import { useAppStore } from '@/store/appStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { HEART_RATE_LOG_INTERVALS, type HeartRateLogInterval, type Units } from '@/types/settings';

const INTERVAL_OPTIONS = HEART_RATE_LOG_INTERVALS.map((minutes) => ({ key: `${minutes}` as const, label: `${minutes}m` }));
const UNIT_OPTIONS: { key: Units; label: string }[] = [
  { key: 'metric', label: 'Metric' },
  { key: 'imperial', label: 'Imperial' },
];

export function HeartRateLogCard() {
  const heartRateLog = useAppStore((state) => state.settings.heartRateLog);
  const setHeartRateLog = useAppStore((state) => state.setHeartRateLog);
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <SectionHeader title="Heart rate logging" />
        <Switch
          value={heartRateLog.enabled}
          onValueChange={(enabled) => setHeartRateLog(enabled, heartRateLog.intervalMinutes)}
          trackColor={{ true: colors.good, false: colors.track }}
          accessibilityLabel="Heart rate logging"
        />
      </View>
      <SegmentedControl
        options={INTERVAL_OPTIONS}
        value={`${heartRateLog.intervalMinutes}`}
        onChange={(key) => setHeartRateLog(heartRateLog.enabled, Number(key) as HeartRateLogInterval)}
      />
      <Text style={typography.caption}>
        Shorter intervals give better sleep and recovery estimates but use more battery.
      </Text>
    </Card>
  );
}

export function UnitsCard() {
  const units = useAppStore((state) => state.settings.units);
  const setUnits = useAppStore((state) => state.setUnits);
  return (
    <Card style={styles.card}>
      <SectionHeader title="Units" />
      <SegmentedControl options={UNIT_OPTIONS} value={units} onChange={setUnits} />
      <Text style={typography.caption}>Used for height, weight and distance. PULSE always stores metric.</Text>
    </Card>
  );
}

type SourceRowProps = { title: string; caption: string; selected: boolean; disabled?: boolean };

function SourceRow({ title, caption, selected, disabled = false }: SourceRowProps) {
  return (
    <PressableOpacity
      disabled={disabled || selected}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      style={styles.sourceRow}>
      <Ionicons
        name={selected ? 'radio-button-on' : 'radio-button-off'}
        size={20}
        color={disabled ? colors.textTertiary : colors.textPrimary}
      />
      <View style={styles.sourceText}>
        <Text style={[typography.body, disabled && styles.disabled]}>{title}</Text>
        <Text style={typography.caption}>{caption}</Text>
      </View>
    </PressableOpacity>
  );
}

export function DataSourceCard() {
  const dataSource = useAppStore((state) => state.settings.dataSource);
  return (
    <Card style={styles.card}>
      <SectionHeader title="Data source" />
      <SourceRow title="Mock data" caption="Realistic data generated on your phone" selected={dataSource === 'mock'} />
      <SourceRow title="Colmi ring" caption="Available after Prompt 5" selected={dataSource === 'ring'} disabled />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
  sourceText: { flex: 1 },
  disabled: { color: colors.textTertiary },
});
