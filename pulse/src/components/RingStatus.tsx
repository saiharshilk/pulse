import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type RingStatusProps = { batteryLabel: string; isConnected: boolean };

// Battery percentage and a ring icon with a green (connected) or gray status dot.
export function RingStatus({ batteryLabel, isConnected }: RingStatusProps) {
  return (
    <View style={styles.row}>
      <Text style={typography.caption}>{batteryLabel}</Text>
      <View>
        <Ionicons name="radio-button-on-outline" size={20} color={colors.textPrimary} />
        <View style={[styles.statusDot, { backgroundColor: isConnected ? colors.good : colors.textTertiary }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
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
