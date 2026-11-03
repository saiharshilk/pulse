import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';

type MeasuringRingProps = {
  progress: number; // 0–1, how much of the measurement window has passed
  spinning: boolean;
  color: string;
  children?: ReactNode;
};

const SPINNER_ARC = 0.18; // the spinning highlight covers 18% of the circle

// A progress ring with a spinning highlight on top while measuring.
export function MeasuringRing({ progress, spinning, color, children }: MeasuringRingProps) {
  const size = layout.measuringRingSize;
  const stroke = layout.measuringRingStroke;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.set(0);
    if (spinning) {
      rotation.set(withRepeat(withTiming(360, { duration: layout.measuringSpinMs, easing: Easing.linear }), -1));
    }
  }, [rotation, spinning]);

  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.get()}deg` }] }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={center} cy={center} r={radius} stroke={colors.track} strokeWidth={stroke} fill="none" />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference * Math.min(1, progress)} ${circumference}`}
          // A round cap would draw a dot at 12 o'clock even at zero, so hide the arc there.
          strokeOpacity={progress > 0 ? 1 : 0}
          fill="none"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {spinning && (
        <Animated.View style={[StyleSheet.absoluteFill, spinStyle]}>
          <Svg width={size} height={size}>
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={colors.textPrimary}
              strokeOpacity={0.5}
              strokeWidth={stroke / 2}
              strokeLinecap="round"
              strokeDasharray={`${circumference * SPINNER_ARC} ${circumference}`}
              fill="none"
            />
          </Svg>
        </Animated.View>
      )}
      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
