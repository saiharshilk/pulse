import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type BandLegendProps = { items: { label: string; color: string }[] };

export function BandLegend({ items }: BandLegendProps) {
  return (
    <View style={styles.row}>
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <View style={[styles.dot, { backgroundColor: item.color }]} />
          <Text style={typography.caption}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
