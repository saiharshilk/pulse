import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { typography } from '@/theme/typography';

type GaugeBarProps = {
  value: number;
  max: number;
  targetLow: number;
  targetHigh: number;
  color: string;
  minLabel: string;
  maxLabel: string;
};

const MARKER_WIDTH = 4;

function percent(value: number, max: number): `${number}%` {
  return `${Math.min(100, Math.max(0, (value / max) * 100))}%`;
}

export function GaugeBar({ value, max, targetLow, targetHigh, color, minLabel, maxLabel }: GaugeBarProps) {
  return (
    <View>
      <View style={styles.track}>
        <View
          style={[
            styles.target,
            {
              left: percent(targetLow, max),
              width: `${Math.max(0, ((targetHigh - targetLow) / max) * 100)}%`,
              backgroundColor: color,
            },
          ]}
        />
        <View style={[styles.marker, { left: percent(value, max) }]} />
      </View>
      <View style={styles.labels}>
        <Text style={typography.caption}>{minLabel}</Text>
        <Text style={typography.caption}>{maxLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: layout.gaugeHeight,
    borderRadius: layout.gaugeHeight / 2,
    backgroundColor: colors.track,
    justifyContent: 'center',
  },
  target: { position: 'absolute', top: 0, bottom: 0, borderRadius: layout.gaugeHeight / 2, opacity: 0.6 },
  marker: {
    position: 'absolute',
    width: MARKER_WIDTH,
    height: layout.gaugeHeight * 2,
    marginLeft: -MARKER_WIDTH / 2,
    borderRadius: MARKER_WIDTH / 2,
    backgroundColor: colors.textPrimary,
  },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
});
