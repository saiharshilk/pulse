import { useId, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import Svg, { ClipPath, Defs, G, Line, Rect } from 'react-native-svg';

import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

import { scaleLinear } from './chartMath';
import { svgId, useChartReveal } from './useChartReveal';

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
  showValueLabels?: boolean; // turn off for long ranges, where labels would overlap
  startLabel?: string; // under the first bar, for long ranges without per-bar labels
  endLabel?: string;
};

export function BarChart({
  bars,
  height,
  maxValue,
  target,
  showValueLabels = true,
  startLabel,
  endLabel,
}: BarChartProps) {
  const [width, setWidth] = useState(0);
  const clipId = svgId('bar-clip', useId());
  const reveal = useChartReveal(bars.map((bar) => bar.value).join(','));

  const largest = Math.max(...bars.map((bar) => bar.value), target?.value ?? 0, 1e-6);
  const max = maxValue ?? largest * HEADROOM;
  const top = showValueLabels ? VALUE_LABEL_HEIGHT : 4;
  const baseY = height - LABEL_HEIGHT;
  const toY = (value: number) => scaleLinear(value, [0, max], [baseY, top]);
  const slot = bars.length === 0 ? 0 : width / bars.length;
  const barWidth = Math.max(1, slot * BAR_WIDTH_RATIO);
  // One clip rectangle grows up from the baseline, revealing every bar at once.
  // It's far cheaper than animating each bar, which matters with 90 bars on screen.
  const clipProps = useAnimatedProps(() => ({ y: baseY - baseY * reveal.get(), height: baseY * reveal.get() }));

  return (
    <View>
      <View style={{ height }} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        {width > 0 && (
          <Svg width={width} height={height}>
            <Defs>
              <ClipPath id={clipId}>
                <AnimatedRect animatedProps={clipProps} x={0} width={width} />
              </ClipPath>
            </Defs>
            <Line x1={0} x2={width} y1={baseY} y2={baseY} stroke={colors.track} strokeWidth={1} />
            <G clipPath={`url(#${clipId})`}>
              {bars.map((bar, i) => {
                const barTop = toY(Math.max(0, bar.value));
                return (
                  <Rect
                    key={`${bar.label}-${i}`}
                    x={slot * i + (slot - barWidth) / 2}
                    y={barTop}
                    width={barWidth}
                    height={baseY - barTop}
                    rx={Math.min(3, barWidth / 2)}
                    fill={bar.color}
                  />
                );
              })}
            </G>
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
              {showValueLabels && (
                <Text style={[styles.value, { top: toY(Math.max(0, bar.value)) - TEXT_HEIGHT - 3 }]}>{bar.valueLabel}</Text>
              )}
              {bar.label !== '' && <Text style={[styles.label, { top: baseY + 4 }]}>{bar.label}</Text>}
            </View>
          ))}
        {width > 0 && target !== undefined && (
          <Text style={[styles.target, { top: toY(target.value) - TEXT_HEIGHT - 2 }]}>{target.label}</Text>
        )}
        {(startLabel !== undefined || endLabel !== undefined) && (
          <View style={[styles.ends, { top: baseY + 4 }]}>
            <Text style={styles.endLabel}>{startLabel}</Text>
            <Text style={styles.endLabel}>{endLabel}</Text>
          </View>
        )}
      </View>
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
  ends: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between' },
  endLabel: { ...typography.caption, fontSize: 11 },
});
