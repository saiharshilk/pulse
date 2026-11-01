import { StyleSheet, Text } from 'react-native';

import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { Card } from './Card';

type StatTileProps = { value: string; caption: string };

export function StatTile({ value, caption }: StatTileProps) {
  return (
    <Card style={styles.tile}>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={typography.caption}>{caption}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, gap: spacing.xs },
  value: { ...typography.metricValue, fontSize: 24 },
});
