import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { ActivityRow, StrainBadge } from '@/components/ActivityRow';
import { Card } from '@/components/Card';
import { SectionHeader } from '@/components/SectionHeader';
import { activityIcon } from '@/features/activities/activityIcons';
import { ActivityNameSheet, type RenameTarget } from '@/features/activities/ActivityNameSheet';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import type { HomeView } from './homeView';

type ActivitiesCardProps = Pick<HomeView, 'activitiesTitle' | 'sleepRow' | 'activityRows' | 'activitiesEmptyText'>;

export function ActivitiesCard({ activitiesTitle, sleepRow, activityRows, activitiesEmptyText }: ActivitiesCardProps) {
  const [renaming, setRenaming] = useState<RenameTarget | null>(null);
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
          icon={activityIcon(row.name)}
          iconColor={colors.strain}
          title={row.name}
          timeRange={row.timeRange}
          duration={row.duration}
          badge={<StrainBadge value={row.strain} />}
          onPress={() => setRenaming({ id: row.id, name: row.name })}
        />
      ))}
      {activityRows.length === 0 && <Text style={typography.caption}>{activitiesEmptyText}</Text>}
      <ActivityNameSheet target={renaming} onClose={() => setRenaming(null)} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.lg },
});
