import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { DateNavigator } from './DateNavigator';

type TopBarProps = {
  dateLabel: string;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  batteryLabel: string;
  isRingConnected: boolean;
};

export function TopBar({ dateLabel, onPrev, onNext, canPrev, canNext, batteryLabel, isRingConnected }: TopBarProps) {
  return (
    <View style={styles.row}>
      <View style={styles.side}>
        <View style={styles.profile}>
          <Ionicons name="person-outline" size={18} color={colors.textPrimary} />
        </View>
      </View>
      <DateNavigator label={dateLabel} onPrev={onPrev} onNext={onNext} canPrev={canPrev} canNext={canNext} />
      <View style={[styles.side, styles.ring]}>
        <Text style={typography.caption}>{batteryLabel}</Text>
        <View>
          <Ionicons name="radio-button-on-outline" size={20} color={colors.textPrimary} />
          <View style={[styles.statusDot, { backgroundColor: isRingConnected ? colors.good : colors.textTertiary }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  // Both sides share the spare width, which keeps the date centered.
  side: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  ring: { justifyContent: 'flex-end', gap: spacing.xs },
  profile: {
    width: layout.profileCircle,
    height: layout.profileCircle,
    borderRadius: layout.profileCircle / 2,
    backgroundColor: colors.iconCircle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    position: 'absolute',
    right: -1,
    top: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderColor: colors.bgTop,
    borderWidth: 1,
  },
});
