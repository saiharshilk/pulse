import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { PressableOpacity } from '@/components/PressableOpacity';
import { SectionHeader } from '@/components/SectionHeader';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import type { HomeView } from './homeView';

type HomeSummaryCardsProps = Pick<HomeView, 'healthStatus' | 'stepsValue' | 'stepsProgress' | 'stepsCaption'>;

export function HomeSummaryCards({ healthStatus, stepsValue, stepsProgress, stepsCaption }: HomeSummaryCardsProps) {
  const router = useRouter();
  return (
    <View style={styles.row}>
      <PressableOpacity style={styles.half} onPress={() => router.push('/health-monitor')}>
        <Card style={styles.card}>
          <SectionHeader title="Health Monitor" chevron />
          <View style={styles.status}>
            <Ionicons name={healthStatus.icon} size={18} color={healthStatus.color} />
            <Text style={[typography.metricValue, styles.statusText]}>{healthStatus.text}</Text>
          </View>
          <Text style={typography.caption}>{healthStatus.caption}</Text>
        </Card>
      </PressableOpacity>

      <PressableOpacity style={styles.half} onPress={() => router.push('/health')}>
        <Card style={styles.card}>
          <SectionHeader title="Steps" chevron />
          <Text style={styles.steps} numberOfLines={1} adjustsFontSizeToFit>
            {stepsValue}
          </Text>
          <View style={styles.track}>
            <View style={[styles.progress, { width: `${stepsProgress * 100}%` }]} />
          </View>
          <Text style={typography.caption}>{stepsCaption}</Text>
        </Card>
      </PressableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // Stretching (the row default) keeps both cards the same height.
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
  card: { flex: 1, gap: spacing.md, padding: spacing.lg },
  status: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statusText: { flexShrink: 1 },
  steps: { ...typography.metricValue, fontSize: 28, fontWeight: '700' },
  track: {
    height: layout.progressBarHeight,
    borderRadius: layout.progressBarHeight / 2,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  progress: { height: '100%', backgroundColor: colors.good },
});
