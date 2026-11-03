import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { PressableOpacity } from './PressableOpacity';

type ActivityRowProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  title: string;
  timeRange: string;
  duration: string;
  tag?: string; // e.g. "EST."
  badge?: ReactNode;
  onPress?: () => void; // makes the row tappable, e.g. to rename the activity
};

// One row in an activity list: icon, name, time range, duration and an optional badge.
export function ActivityRow({ icon, iconColor, title, timeRange, duration, tag, badge, onPress }: ActivityRowProps) {
  const content = (
    <>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.rowText}>
        <View style={styles.titleLine}>
          <Text style={typography.labelCaps} numberOfLines={1}>
            {title}
          </Text>
          {tag !== undefined && <Text style={styles.tag}>{tag}</Text>}
        </View>
        <Text style={typography.caption}>{timeRange}</Text>
      </View>
      <Text style={typography.metricValue}>{duration}</Text>
      {badge}
    </>
  );
  if (onPress === undefined) return <View style={styles.row}>{content}</View>;
  return (
    <PressableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${timeRange}, ${duration}. Rename`}
      style={styles.row}>
      {content}
    </PressableOpacity>
  );
}

// The small blue square showing how much strain an activity added.
export function StrainBadge({ value }: { value: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconCircle: {
    width: layout.iconCircle,
    height: layout.iconCircle,
    borderRadius: layout.iconCircle / 2,
    backgroundColor: colors.iconCircle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  titleLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tag: { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: colors.textSecondary },
  badge: {
    width: layout.strainBadgeSize,
    height: layout.strainBadgeSize,
    borderRadius: 6,
    backgroundColor: colors.strain,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'], color: colors.textPrimary },
});
