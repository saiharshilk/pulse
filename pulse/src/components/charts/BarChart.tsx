import { useId, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import Svg, { ClipPath, Defs, G, Line, Rect } from 'react-native-svg';

import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

import { boxesOverlap, scaleLinear, type Box } from './chartMath';
import { svgId, useChartReveal } from './useChartReveal';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const VALUE_LABEL_HEIGHT = 18;
const LABEL_HEIGHT = 20;
const BAR_WIDTH_RATIO = 0.56;
const HEADROOM = 1.1; // keeps the tallest bar's label off the top edge
const TEXT_HEIGHT = 14;
const PILL_PADDING = 6;
const PILL_GAP = 3; // space between the reference line and its label
const ESTIMATED_CHAR_WIDTH = 6; // until the label has been measured

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
  const [targetLabelWidth, setTargetLabelWidth] = useState<number | null>(null);
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

  // The reference label sits at the left end of its line, just above it.
  const targetLabelBox: Box | null =
    target === undefined
      ? null
      : {
          x: 0,
          y: toY(target.value) - TEXT_HEIGHT - PILL_GAP,
          width: targetLabelWidth ?? target.label.length * ESTIMATED_CHAR_WIDTH + PILL_PADDING * 2,
          height: TEXT_HEIGHT,
        };
  const valueLabelTop = (bar: BarDatum) => toY(Math.max(0, bar.value)) - TEXT_HEIGHT - 3;
  // A bar's value label is dropped if it would collide with the reference label.
  const showsValueLabel = (bar: BarDatum, i: number) =>
    showValueLabels &&
    (targetLabelBox === null ||
      !boxesOverlap({ x: slot * i, y: valueLabelTop(bar), width: slot, height: TEXT_HEIGHT }, targetLabelBox));

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
              {showsValueLabel(bar, i) && <Text style={[styles.value, { top: valueLabelTop(bar) }]}>{bar.valueLabel}</Text>}
              {bar.label !== '' && <Text style={[styles.label, { top: baseY + 4 }]}>{bar.label}</Text>}
            </View>
          ))}
        {width > 0 && target !== undefined && targetLabelBox !== null && (
          <View
            pointerEvents="none"
            style={[styles.targetPill, { top: targetLabelBox.y }]}
            onLayout={(event) => setTargetLabelWidth(event.nativeEvent.layout.width)}>
            <Text style={styles.target}>{target.label}</Text>
          </View>
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
  targetPill: {
    position: 'absolute',
    left: 0,
    height: TEXT_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: PILL_PADDING,
    borderRadius: TEXT_HEIGHT / 2,
    backgroundColor: colors.labelPill,
  },
  target: { ...typography.caption, fontSize: 10 },
  ends: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between' },
  endLabel: { ...typography.caption, fontSize: 11 },
});
