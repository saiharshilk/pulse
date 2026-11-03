import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import Svg, { Line, Rect } from 'react-native-svg';

import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

import { scaleLinear } from './chartMath';
import { useChartReveal } from './useChartReveal';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const VALUE_LABEL_HEIGHT = 18;
const LABEL_HEIGHT = 20;
const BAR_WIDTH_RATIO = 0.56;
const HEADROOM = 1.1; // keeps the tallest bar's label off the top edge
const TEXT_HEIGHT = 14;

export type BarDatum = { label: string; value: number; color: string; valueLabel: string };

type BarChartProps = {
  bars: BarDatum[];
  height: number;
  maxValue?: number;
  target?: { value: number; label: string }; // dashed line across the chart
};

type BarProps = { x: number; width: number; baseY: number; fullHeight: number; color: string; reveal: SharedValue<number> };

function Bar({ x, width, baseY, fullHeight, color, reveal }: BarProps) {
  // Each bar grows up from the baseline.
  const props = useAnimatedProps(() => ({
    y: baseY - fullHeight * reveal.get(),
    height: fullHeight * reveal.get(),
  }));
  return <AnimatedRect animatedProps={props} x={x} width={width} rx={3} fill={color} />;
}

export function BarChart({ bars, height, maxValue, target }: BarChartProps) {
  const [width, setWidth] = useState(0);
  const reveal = useChartReveal(bars.map((bar) => bar.value).join(','));

  const largest = Math.max(...bars.map((bar) => bar.value), target?.value ?? 0, 1e-6);
  const max = maxValue ?? largest * HEADROOM;
  const baseY = height - LABEL_HEIGHT;
  const toY = (value: number) => scaleLinear(value, [0, max], [baseY, VALUE_LABEL_HEIGHT]);
  const slot = bars.length === 0 ? 0 : width / bars.length;
  const barWidth = slot * BAR_WIDTH_RATIO;

  return (
    <View style={{ height }} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {width > 0 && (
        <Svg width={width} height={height}>
          <Line x1={0} x2={width} y1={baseY} y2={baseY} stroke={colors.track} strokeWidth={1} />
          {bars.map((bar, i) => {
            const center = slot * i + slot / 2;
            const top = toY(Math.max(0, bar.value));
            return (
              <Bar
                key={`${bar.label}-${i}`}
                x={center - barWidth / 2}
                width={barWidth}
                baseY={baseY}
                fullHeight={baseY - top}
                color={bar.color}
                reveal={reveal}
              />
            );
          })}
          {target !== undefined && (
            <Line
              x1={0}
              x2={width}
              y1={toY(target.value)}
              y2={toY(target.value)}
              stroke={colors.textSecondary}
              strokeDasharray="4 4"
              strokeWidth={1}
            />
          )}
        </Svg>
      )}
      {/* Labels are plain Text so they use the system font, which SVG text doesn't. */}
      {width > 0 &&
        bars.map((bar, i) => (
          <View key={`labels-${i}`} pointerEvents="none" style={[StyleSheet.absoluteFill, { left: slot * i, width: slot }]}>
            <Text style={[styles.value, { top: toY(Math.max(0, bar.value)) - TEXT_HEIGHT - 3 }]}>{bar.valueLabel}</Text>
            <Text style={[styles.label, { top: baseY + 4 }]}>{bar.label}</Text>
          </View>
        ))}
      {width > 0 && target !== undefined && (
        <Text style={[styles.target, { top: toY(target.value) - TEXT_HEIGHT - 2 }]}>{target.label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  value: {
    ...typography.caption,
    position: 'absolute',
    left: 0,
    right: 0,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.textPrimary,
  },
  label: { ...typography.caption, position: 'absolute', left: 0, right: 0, fontSize: 11, textAlign: 'center' },
  target: { ...typography.caption, position: 'absolute', right: 0, fontSize: 10 },
});
