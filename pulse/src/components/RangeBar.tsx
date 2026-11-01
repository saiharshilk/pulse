import { StyleSheet, View } from 'react-native';

import { SLEEP_BANDS } from '@/scoring/scoringConstants';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';

type RangeBarProps = { value: number }; // 0–100

export function RangeBar({ value }: RangeBarProps) {
  const position = Math.min(100, Math.max(0, value));
  return (
    <View style={styles.root}>
      <View style={styles.bar}>
        <View style={{ flex: SLEEP_BANDS.sufficient, backgroundColor: colors.bandPoor }} />
        <View style={{ flex: SLEEP_BANDS.optimal - SLEEP_BANDS.sufficient, backgroundColor: colors.bandSufficient }} />
        <View style={{ flex: 100 - SLEEP_BANDS.optimal, backgroundColor: colors.bandOptimal }} />
      </View>
      <View style={[styles.marker, { left: `${position}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { height: layout.rangeMarkerHeight, justifyContent: 'center' },
  bar: {
    flexDirection: 'row',
    height: layout.rangeBarHeight,
    borderRadius: layout.rangeBarHeight / 2,
    overflow: 'hidden',
    gap: 2,
  },
  marker: {
    position: 'absolute',
    width: layout.rangeMarkerWidth,
    height: layout.rangeMarkerHeight,
    marginLeft: -layout.rangeMarkerWidth / 2,
    borderRadius: layout.rangeMarkerWidth / 2,
    backgroundColor: colors.textPrimary,
  },
});
