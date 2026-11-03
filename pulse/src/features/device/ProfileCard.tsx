import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { PressableOpacity } from '@/components/PressableOpacity';
import { SectionHeader } from '@/components/SectionHeader';
import { useAppStore } from '@/store/appStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { displayValue, FIELD_LABELS, PROFILE_FIELD_ORDER, type ProfileFieldKey } from './profileFields';
import { ProfileEditSheet } from './ProfileEditSheet';

export function ProfileCard() {
  const profile = useAppStore((state) => state.profile);
  const units = useAppStore((state) => state.settings.units);
  const [editing, setEditing] = useState<ProfileFieldKey | null>(null);

  return (
    <Card style={styles.card}>
      <SectionHeader title="Profile" />
      {PROFILE_FIELD_ORDER.map((field, i) => (
        <PressableOpacity
          key={field}
          onPress={() => setEditing(field)}
          accessibilityRole="button"
          accessibilityLabel={`${FIELD_LABELS[field]}, ${displayValue(field, profile, units)}. Edit`}
          style={[styles.row, i > 0 && styles.divider]}>
          <Text style={typography.body}>{FIELD_LABELS[field]}</Text>
          <View style={styles.value}>
            <Text style={[typography.body, styles.valueText]} numberOfLines={1}>
              {displayValue(field, profile, units)}
            </Text>
            <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
          </View>
        </PressableOpacity>
      ))}
      <ProfileEditSheet field={editing} onClose={() => setEditing(null)} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 0 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md },
  divider: { borderTopColor: colors.cardStroke, borderTopWidth: 1 },
  value: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexShrink: 1 },
  valueText: { color: colors.textSecondary },
});
