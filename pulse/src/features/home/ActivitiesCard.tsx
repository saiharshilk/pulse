import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text } from 'react-native';

import { ActivityRow, StrainBadge } from '@/components/ActivityRow';
import { Card } from '@/components/Card';
import { SectionHeader } from '@/components/SectionHeader';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import type { HomeView } from './homeView';

type ActivitiesCardProps = Pick<HomeView, 'activitiesTitle' | 'sleepRow' | 'activityRows' | 'activitiesEmptyText'>;

export function ActivitiesCard({ activitiesTitle, sleepRow, activityRows, activitiesEmptyText }: ActivitiesCardProps) {
  return (
    <Card style={styles.card}>
      <SectionHeader
        title={activitiesTitle}
        right={<Ionicons name="expand-outline" size={16} color={colors.textSecondary} />}
      />
      {sleepRow !== null && (
        <ActivityRow
          icon="moon"
          iconColor={colors.sleep}
          title="Sleep"
          timeRange={sleepRow.timeRange}
          duration={sleepRow.duration}
          tag="EST."
        />
      )}
      {activityRows.map((row) => (
        <ActivityRow
          key={row.id}
          icon="walk"
          iconColor={colors.strain}
          title={row.name}
          timeRange={row.timeRange}
          duration={row.duration}
          badge={<StrainBadge value={row.strain} />}
        />
      ))}
      {activityRows.length === 0 && <Text style={typography.caption}>{activitiesEmptyText}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.lg },
});
