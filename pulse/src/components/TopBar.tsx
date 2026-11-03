import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

import { DateNavigator } from './DateNavigator';
import { RingStatus } from './RingStatus';

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
        <RingStatus batteryLabel={batteryLabel} isConnected={isRingConnected} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  // Both sides share the spare width, which keeps the date centered.
  side: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  ring: { justifyContent: 'flex-end' },
  profile: {
    width: layout.profileCircle,
    height: layout.profileCircle,
    borderRadius: layout.profileCircle / 2,
    backgroundColor: colors.iconCircle,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
