import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type SectionHeaderProps = { title: string; chevron?: boolean; right?: ReactNode };

export function SectionHeader({ title, chevron = false, right }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={[typography.labelCaps, styles.title]} numberOfLines={2}>
        {title}
      </Text>
      {chevron && <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />}
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs },
  title: { flexShrink: 1 },
});
