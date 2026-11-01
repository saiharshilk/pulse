import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Sparkline } from '@/components/charts/Sparkline';
import { PressableOpacity } from '@/components/PressableOpacity';
import { SectionHeader } from '@/components/SectionHeader';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type HeartRateCardProps = { value: string; caption: string; sparklineValues: number[] };

export function HeartRateCard({ value, caption, sparklineValues }: HeartRateCardProps) {
  const router = useRouter();
  return (
    <Card style={styles.card}>
      <SectionHeader title="Heart Rate" />
      <View style={styles.reading}>
        <Text style={styles.value}>{value}</Text>
        <Text style={typography.caption}>{`bpm · ${caption}`}</Text>
      </View>
      <Sparkline values={sparklineValues} color={colors.recoveryRed} height={layout.sparklineHeight} />
      <PressableOpacity onPress={() => router.push('/live')}>
        <Text style={styles.link}>TAP FOR LIVE READING →</Text>
      </PressableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  reading: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  value: { ...typography.dialValue, fontSize: 40 },
  link: { ...typography.labelCaps, fontSize: 12, color: colors.link },
});
